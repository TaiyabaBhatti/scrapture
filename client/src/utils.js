// Anonymous id so people can see "my ideas" without logging in
export function getClientId() {
  try {
    let id = localStorage.getItem('scrapture_client');
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
      localStorage.setItem('scrapture_client', id);
    }
    return id;
  } catch {
    return 'guest-' + Math.random().toString(16).slice(2);
  }
}

// Shrink phone photos (often 4-10 MB) before upload: faster on mobile data
export function resizeImage(file, max = 1280) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not read this photo'))), 'image/jpeg', 0.85);
    };
    img.onerror = () => reject(new Error('Could not read this photo. Try a JPG or PNG.'));
    img.src = url;
  });
}

export const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

export const downloadDataUrl = (url, name) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

export const whatsappLink = (idea, imageUrl) => {
  const lines = [
    `*${idea.title}*`,
    idea.summary,
    '',
    ...idea.steps.slice(0, 5).map((s, i) => `${i + 1}. ${s}`),
    '',
    imageUrl || '',
    'Made with Scrapture',
  ];
  return `https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`;
};
