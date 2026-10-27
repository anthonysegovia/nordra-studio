(() => {
  'use strict';
  const trigger = document.querySelector('.invitation-download');
  const dialog = document.querySelector('#download-dialog');
  const shareButton = dialog.querySelector('.save-to-phone');
  const shareSlot = dialog.querySelector('.share-slot');
  const status = dialog.querySelector('.keepsake-status');
  const preview = dialog.querySelector('.keepsake-preview');
  const motion = window.PosadaMotion;
  let shareFile;
  let preparing;
  let dialogAnimation;
  let sequence = 0;
  let closing = false;
  const arrivals = new Set();

  function previewReady() { preview.classList.add('is-ready'); }
  if (preview.complete && preview.naturalWidth) previewReady();
  else preview.addEventListener('load', previewReady, { once: true });

  function clearArrivals() {
    for (const animation of arrivals) animation.cancel();
    arrivals.clear();
  }
  function enterDialog() {
    const turn = ++sequence;
    closing = false;
    dialogAnimation?.cancel();
    clearArrivals();
    dialog.classList.remove('is-closing');
    dialog.showModal();
    document.documentElement.classList.add('keepsake-open');
    dialogAnimation = motion.run(dialog, [
      { opacity: 0, transform: 'translateY(12px) scale(.985)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' }
    ], { duration: 440, fill: 'both' });
    if (dialogAnimation) dialogAnimation.finished.then(() => {
      if (turn === sequence) dialogAnimation.cancel();
    }, () => {});
    [dialog.querySelector('h2'), dialog.querySelector('#download-description'), dialog.querySelector('.keepsake-actions'), dialog.querySelector('.keepsake-hint')].forEach((element, index) => {
      const animation = motion.run(element, [{ opacity: 0, translate: '0 5px' }, { opacity: 1, translate: '0 0' }], { duration: 420, delay: 55 + index * 35, fill: 'backwards' });
      if (animation) {
        arrivals.add(animation);
        animation.finished.then(() => arrivals.delete(animation), () => arrivals.delete(animation));
      }
    });
  }
  function closeDialog() {
    if (!dialog.open || closing) return;
    const turn = ++sequence;
    closing = true;
    const current = getComputedStyle(dialog);
    const from = { opacity: current.opacity, transform: current.transform };
    dialog.style.setProperty('--veil-opacity', getComputedStyle(dialog, '::backdrop').opacity);
    dialogAnimation?.cancel();
    dialog.classList.add('is-closing');
    function finish() {
      if (turn !== sequence) return;
      dialog.close();
      clearArrivals();
      dialogAnimation?.cancel();
      dialog.classList.remove('is-closing');
      dialog.style.removeProperty('--veil-opacity');
      closing = false;
    }
    dialogAnimation = motion.run(dialog, [from, { opacity: 0, transform: 'translateY(7px) scale(.99)' }], { duration: 260, fill: 'both' });
    if (dialogAnimation) dialogAnimation.finished.then(finish, () => {});
    else finish();
  }

  // Preload only after opening the preview. Sharing itself runs directly in the
  // second tap, preserving the user activation required by Safari and Chrome.
  function prepareSharing() {
    if (!navigator.canShare || !navigator.share || preparing) return;
    preparing = fetch(trigger.href).then(response => {
      if (!response.ok) throw new Error('Image unavailable');
      return response.blob();
    }).then(blob => {
      shareFile = new File([blob], 'invitacion-posada-demo.jpg', { type: 'image/jpeg' });
      if (navigator.canShare({ files: [shareFile] })) {
        shareButton.hidden = false;
        shareSlot.classList.add('is-ready');
      }
    }).catch(() => {
      // The preview, long press and ordinary download remain available.
      preparing = null;
    });
  }

  trigger.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    status.textContent = '';
    enterDialog();
    prepareSharing();
  });
  dialog.querySelector('.dialog-close').addEventListener('click', closeDialog);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(); });
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) closeDialog();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('keepsake-open');
    trigger.focus({ preventScroll: true });
  });
  shareButton.addEventListener('click', async () => {
    if (!shareFile || shareButton.disabled) return;
    shareButton.disabled = true;
    status.textContent = '';
    try {
      await navigator.share({ files: [shareFile], title: 'Se viene la posada · Demo' });
    } catch (error) {
      if (error.name !== 'AbortError') status.textContent = 'Puedes usar Descargar imagen o mantenerla presionada para guardarla.';
    } finally {
      shareButton.disabled = false;
    }
  });
})();
