// debug msg to confirm script loaded
console.log("script.js loaded");

const btn = document.getElementById('generate');
const out = document.getElementById('out');
const copy = document.getElementById('copy');
const reset = document.getElementById('reset');
const slider = document.getElementById('len');
const lenValue = document.getElementById('len-value');

// slider live update + track style
slider.addEventListener('input', () => {
  lenValue.textContent = slider.value;
  const percent = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background = `linear-gradient(90deg, #00c6ff ${percent}%, #2b2b2b ${percent}%)`;
});

// generate
btn.onclick = async () => {
  console.log("Generate clicked");
  const len = Number(slider.value);
  const payload = {
    length: len,
    lower: document.getElementById('lower').checked,
    upper: document.getElementById('upper').checked,
    digits: document.getElementById('digits').checked,
    symbols: document.getElementById('symbols').checked
  };

  try {
    const res = await fetch('/generate', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });

    // if response not ok, show text (helps debugging server HTML error)
    if (!res.ok) {
      const text = await res.text();
      console.error("Server returned non-OK:", res.status, text);
      alert("Server error: " + (text || res.status));
      return;
    }

    // parse JSON safely
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      if (json.password) {
        out.value = json.password;
        out.classList.add("out-glow");
        setTimeout(() => out.classList.remove("out-glow"), 600);
      } else {
        alert(json.error || "Unknown error from server");
      }
    } catch (e) {
      console.error("Invalid JSON from server:", text);
      alert("Server did not return valid JSON. Check server log (terminal).");
    }
  } catch (err) {
    console.error("Fetch error:", err);
    alert("Network/fetch error. Is Flask running? See console/terminal.");
  }
};

// copy
copy.onclick = () => {
  if (!out.value) { alert("No password to copy"); return; }
  navigator.clipboard.writeText(out.value).then(() => {
    copy.textContent = "✅ Copied!";
    setTimeout(() => (copy.textContent = "Copy"), 1500);
  }).catch(err => {
    console.error("Clipboard error:", err);
    alert("Copy failed");
  });
};

// reset
reset.onclick = () => {
  slider.value = 16;
  lenValue.textContent = 16;
  document.querySelectorAll('input[type=checkbox]').forEach(cb => cb.checked = true);
  out.value = "";
  slider.style.background = '';
};


// Particle CSS
const style = document.createElement('style');
style.innerHTML = `
  .particle {
    position: fixed;
    bottom: 0;
    width: 6px;
    height: 6px;
    background: #00e5ff;
    border-radius: 50%;
    opacity: 0.7;
    animation: rise linear infinite;
  }
  @keyframes rise {
    from {transform: translateY(0) scale(1);}
    to {transform: translateY(-100vh) scale(0);}
  }
  .highlight {
    animation: glowOut 0.5s ease;
  }
  @keyframes glowOut {
    from {box-shadow: 0 0 15px #00e5ff;}
    to {box-shadow: none;}
  }
`;
document.head.appendChild(style);
