import * as fabric from 'fabric';

const canvas = shallowRef<fabric.Canvas | null>(null);

function renderRotateControl(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _: any,
  __: any,
  clockwise: boolean,
) {
  const size = 26;
  ctx.save();
  ctx.translate(left, top);

  // White circle background
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = '#fff0';
  ctx.fill();
  ctx.strokeStyle = '#045cab';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Rotation arrow arc
  ctx.beginPath();
  ctx.strokeStyle = '#045cab';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  const arcRadius = 6;
  if (clockwise) {
    ctx.arc(0, 0, arcRadius, -Math.PI * 0.45, Math.PI * 0.65);
  } else {
    ctx.arc(0, 0, arcRadius, -Math.PI * 0.65, Math.PI * 0.45);
  }
  ctx.stroke();

  // Arrowhead
  const tipAngle = clockwise ? Math.PI * 0.95 : -Math.PI * 0.95;
  const tipX = Math.cos(tipAngle) * arcRadius + (clockwise ? -1 : -2);
  const tipY = Math.sin(tipAngle) * arcRadius + (clockwise ? 0.3 : 0);
  const headLen = 8;
  const headAngle = !clockwise
    ? tipAngle + Math.PI * 0.72
    : tipAngle - Math.PI * 0.72;

  ctx.beginPath();
  ctx.fillStyle = '#045cab';
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(
    tipX + Math.cos(headAngle - 0.5) * headLen,
    tipY + Math.sin(headAngle - 0.5) * headLen,
  );
  ctx.lineTo(
    tipX + Math.cos(headAngle + 0.5) * headLen,
    tipY + Math.sin(headAngle + 0.5) * headLen,
  );
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function createRotateControl(
  degrees: number,
  pixelOffsetX: number,
): fabric.Control {
  const clockwise = degrees > 0;
  return new fabric.Control({
    x: 0,
    y: 0,
    sizeX: 32,
    sizeY: 32,
    cursorStyle: 'pointer',
    // Position above the bounding rect center, ignoring object rotation
    positionHandler: (_dim, _finalMatrix, fabricObject) => {
      const bound = fabricObject.getBoundingRect();
      const centerX = bound.left + bound.width / 2;
      return new fabric.Point(centerX + pixelOffsetX, bound.top - 30);
    },
    actionHandler: () => false,
    mouseUpHandler: (_eventData, transform) => {
      const target = transform.target;
      target.rotate(((target.angle ?? 0) + degrees) % 360);
      target.setCoords();
      canvas.value?.requestRenderAll();
      return true;
    },
    render: (ctx, left, top, styleOverride, fabricObject) => {
      renderRotateControl(
        ctx,
        left,
        top,
        styleOverride,
        fabricObject,
        clockwise,
      );
    },
  });
}

export function useFabric() {
  function initCanvas(
    canvasEl: HTMLCanvasElement,
    width: number,
    height: number,
  ) {
    if (canvas.value) {
      canvas.value.dispose();
    }
    canvas.value = new fabric.Canvas(canvasEl, {
      width,
      height,
      selection: true,
      controlsAboveOverlay: true,
    });
    return canvas.value;
  }

  async function setBackgroundImage(url: string) {
    if (!canvas.value) return;
    const proxyUrl = url.startsWith('/images/') ? assetUrl(url) : useBackend().url(`/api/proxy-image?url=${encodeURIComponent(url)}`);
    const img = await fabric.FabricImage.fromURL(proxyUrl, {
      crossOrigin: 'anonymous',
    });
    const c = canvas.value;
    const scaleX = c.width! / img.width!;
    const scaleY = c.height! / img.height!;
    const scale = Math.max(scaleX, scaleY);
    img.set({
      scaleX: scale,
      scaleY: scale,
      originX: 'left',
      originY: 'top',
      selectable: false,
      evented: false,
    });
    c.backgroundImage = img;
    c.renderAll();
  }

  async function addLogo(
    url: string,
    options?: {
      left?: number;
      top?: number;
      scaleX?: number;
      scaleY?: number;
      angle?: number;
    },
  ) {
    if (!canvas.value) return;
    const img = await fabric.FabricImage.fromURL(url, {
      crossOrigin: 'anonymous',
    });
    const c = canvas.value;
    const defaultScale = Math.min(
      (c.width! * 0.3) / img.width!,
      (c.height! * 0.3) / img.height!,
    );
    img.set({
      left: options?.left ?? c.width! / 2,
      top: options?.top ?? c.height! / 2,
      scaleX: options?.scaleX ?? defaultScale,
      scaleY: options?.scaleY ?? defaultScale,
      angle: options?.angle ?? 0,
      originX: 'center',
      originY: 'center',
      centeredScaling: true,
      lockUniScaling: true,
      lockScalingFlip: true,
      cornerSize: 12,
      cornerColor: '#045cab',
      cornerStrokeColor: '#045cab',
      borderColor: '#045cab',
      transparentCorners: false,
      padding: 8,
    });
    // Keep only corner resize controls + custom rotation controls
    img.setControlsVisibility({
      ml: false,
      mr: false,
      mt: false,
      mb: false,
      mtr: false,
    });
    img.controls.rotateLeft = createRotateControl(-90, -18);
    img.controls.rotateRight = createRotateControl(90, 18);
    c.add(img);
    c.setActiveObject(img);
    c.renderAll();
  }

  async function updateLogoImage(url: string) {
    if (!canvas.value) return;
    const objects = canvas.value.getObjects();
    if (objects.length === 0) return;
    const oldLogo = objects[0] as fabric.FabricImage;
    const position = {
      left: oldLogo.left!,
      top: oldLogo.top!,
      scaleX: oldLogo.scaleX!,
      scaleY: oldLogo.scaleY!,
      angle: oldLogo.angle!,
    };
    const filters = oldLogo.filters ? [...oldLogo.filters] : [];
    canvas.value.remove(oldLogo);
    await addLogo(url, position);
    // Re-apply color mode filters
    const newObjects = canvas.value.getObjects();
    if (newObjects.length > 0 && filters.length > 0) {
      const newLogo = newObjects[0] as fabric.FabricImage;
      newLogo.filters = filters;
      newLogo.applyFilters();
      canvas.value.renderAll();
    }
  }

  function rotateLogo(degrees: number) {
    if (!canvas.value) return;
    const objects = canvas.value.getObjects();
    if (objects.length === 0) return;
    const logo = objects[0];
    logo.rotate((logo.angle! + degrees) % 360);
    canvas.value.renderAll();
  }

  function getLogoPosition() {
    if (!canvas.value) return null;
    const objects = canvas.value.getObjects();
    if (objects.length === 0) return null;
    const logo = objects[0];
    return {
      left: logo.left!,
      top: logo.top!,
      scaleX: logo.scaleX!,
      scaleY: logo.scaleY!,
      angle: logo.angle!,
    };
  }

  function exportCanvasDataUrl(): string | null {
    if (!canvas.value) return null;
    return canvas.value.toDataURL({
      format: 'png',
      multiplier: 2,
    });
  }

  async function exportCanvas(): Promise<Blob | null> {
    const dataUrl = exportCanvasDataUrl();
    if (!dataUrl) return null;
    try {
      const res = await fetch(dataUrl);
      return await res.blob();
    } catch {
      return null;
    }
  }

  function setLogoColorMode(mode: 'color' | 'black' | 'white') {
    if (!canvas.value) return;
    const objects = canvas.value.getObjects();
    if (objects.length === 0) return;
    const logo = objects[0] as fabric.FabricImage;
    if (mode === 'black') {
      logo.filters = [new fabric.filters.Brightness({ brightness: -1 })];
    } else if (mode === 'white') {
      logo.filters = [new fabric.filters.Brightness({ brightness: 1 })];
    } else {
      logo.filters = [];
    }
    logo.applyFilters();
    canvas.value.renderAll();
  }

  function dispose() {
    if (canvas.value) {
      canvas.value.dispose();
      canvas.value = null;
    }
  }

  return {
    canvas,
    initCanvas,
    setBackgroundImage,
    addLogo,
    updateLogoImage,
    rotateLogo,
    getLogoPosition,
    exportCanvasDataUrl,
    exportCanvas,
    setLogoColorMode,
    dispose,
  };
}
