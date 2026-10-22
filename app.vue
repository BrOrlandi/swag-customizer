<template>
  <div class="min-h-screen bg-light-bg font-sans flex flex-col print:bg-white print:min-h-0">
    <AppHeader />
    <main class="container mx-auto px-4 py-6 flex-1 print:p-0 print:max-w-none">
      <NuxtPage />
    </main>
    <AppFooter />
    <AiChatWindow />
  </div>
</template>

<style>
@media print {
  @page {
    size: A4;
    margin: 0;
  }

  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Proposal content fills the page */
  #proposal-content {
    box-shadow: none !important;
    border-radius: 0 !important;
  }

  /* Personalized images: ensure grid images fit and don't overflow */
  #proposal-content img {
    break-inside: avoid;
  }
}
</style>
