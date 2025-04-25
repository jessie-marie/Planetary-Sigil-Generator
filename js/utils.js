// === Generate and Download PNG from SVG ===
function downloadSVGAsPNG(svgElement, filename, scale = 3) {
    const clonedSvg = svgElement.cloneNode(true);
    const originalWidth = parseInt(clonedSvg.getAttribute("width")) || 300;
    const originalHeight = parseInt(clonedSvg.getAttribute("height")) || 300;
  
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
  
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = originalWidth * scale;
      canvas.height = originalHeight * scale;
  
      const ctx = canvas.getContext("2d");
      ctx.setTransform(scale, 0, 0, scale, 0, 0); // Scale drawing context
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
  
      const png = canvas.toDataURL("image/png");
  
      const link = document.createElement("a");
      link.href = png;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      URL.revokeObjectURL(url);
    };
  
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }
  
  