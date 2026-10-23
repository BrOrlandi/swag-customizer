<template>
  <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
    <AiChatButton />
    <BaseButton variant="accent" size="lg" @click="navigateTo('/edit')">
      <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
      Criar Novo Kit
    </BaseButton>
  </div>
</template>
