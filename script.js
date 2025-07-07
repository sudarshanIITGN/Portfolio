const textElement = document.getElementById("decrypt-text");
const originalText = textElement.textContent; // Store the original text

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&?!";

// Maps to store original content and active intervals for each *individual* text element
const originalHTMLMap = new Map();
const intervalsMap = new Map();

// Function to scramble HTML content, preserving tags like <br>
function scrambleContent(content) {
  // Matches HTML tags, sequences of non-whitespace/non-tag characters (words), or spaces
  const parts = content.match(/<[^>]+>|[^<>\s]+|\s/g) || [];

  return parts.map(part => {
    if (part.startsWith('<') && part.endsWith('>')) {
      return part; // HTML tag, return as is
    }
    if (part === ' ') {
      return ' '; // Space, return as is
    }
    // Scramble individual characters within words/text segments
    return part.split('').map(char => {
      return characters[Math.floor(Math.random() * characters.length)];
    }).join('');
  }).join('');
}

// Function to start the descrambling animation for a single element
function startDescrambleAnimation(element, originalContent) {
  let iteration = 0;
  // Clear any existing interval for this specific element before starting a new one
  clearInterval(intervalsMap.get(element));

  const interval = setInterval(() => {
    // Re-split the original content to process parts correctly
    const originalParts = originalContent.match(/<[^>]+>|[^<>\s]+|\s/g) || [];

    let currentCharIndex = 0; // Tracks progress through actual characters, ignoring tags
    const descrambledParts = originalParts.map(part => {
      if (part.startsWith('<') && part.endsWith('>')) {
        return part; // Preserve HTML tags
      }
      if (part === ' ') {
        currentCharIndex++;
        return ' ';
      }

      let revealedPart = '';
      for (let i = 0; i < part.length; i++) {
        if (currentCharIndex < iteration) {
          revealedPart += part[i]; // Reveal original character
        } else {
          revealedPart += characters[Math.floor(Math.random() * characters.length)]; // Scramble
        }
        currentCharIndex++;
      }
      return revealedPart;
    });

    element.innerHTML = descrambledParts.join('');

    iteration += 0.5; // Controls the speed of descrambling (smaller value = slower)

    // Check if enough iterations have passed to reveal all actual characters
    // Calculate total text length by removing HTML tags first
    const totalTextLength = originalContent.replace(/<[^>]+>/g, '').length;
    if (iteration >= totalTextLength) {
      clearInterval(interval);
      element.innerHTML = originalContent; // Ensure it ends up as the exact original content
      intervalsMap.delete(element); // Clean up the interval reference
    }
  }, 30); // Animation frame rate (smaller value = faster animation)
  intervalsMap.set(element, interval); // Store the interval ID for this element
}

// Function to set an element back to its scrambled state
function setScrambledState(element, originalContent) {
  clearInterval(intervalsMap.get(element)); // Stop any ongoing descrambling
  element.innerHTML = scrambleContent(originalContent); // Instantly scramble
  intervalsMap.delete(element); // Clean up the interval reference
}


// --- Initialization Logic ---

document.addEventListener("DOMContentLoaded", () => {
  // Get all elements that act as a decrypt text group container
  const allDecryptTextGroups = document.querySelectorAll(".decrypt-text-group");

  allDecryptTextGroups.forEach(group => {
    // Select all potential text elements within this specific group
    // We use a more generic selector for direct children if they contain text
    const groupTextElements = group.querySelectorAll("h1, div.intro-text, div.decrypt-subtext, div.decrypt-text-line");

    // Initialize each text element within the current group
    groupTextElements.forEach(element => {
      originalHTMLMap.set(element, element.innerHTML); // Store original HTML content
      element.innerHTML = scrambleContent(element.innerHTML); // Apply initial scramble
    });

    // Add event listeners to the *group container* itself
    group.addEventListener("mouseenter", () => {
      groupTextElements.forEach(element => {
        const originalContent = originalHTMLMap.get(element);
        if (originalContent) { // Ensure original content exists
          startDescrambleAnimation(element, originalContent);
        }
      });
    });

    group.addEventListener("mouseleave", () => {
      groupTextElements.forEach(element => {
        const originalContent = originalHTMLMap.get(element);
        if (originalContent) { // Ensure original content exists
          setScrambledState(element, originalContent);
        }
      });
    });
  });
});
function generatePixels(container, imageUrl) {
  const size = 10;
  const cols = Math.floor(container.offsetWidth / size);
  const rows = Math.floor(container.offsetHeight / size);

  container.style.backgroundImage = `url(${imageUrl})`;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const pixel = document.createElement('div');
      pixel.classList.add('pixel');
      pixel.style.left = `${x * size}px`;
      pixel.style.top = `${y * size}px`;
      container.appendChild(pixel);
    }
  }

  const pixels = container.querySelectorAll('.pixel');
  let animated = false;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        pixels.forEach((p, i) => {
          const dx = (Math.random() - 0.5) * 60;
          const dy = (Math.random() - 0.5) * 60;
          const scale = 0.5 + Math.random();
          const angle = (Math.random() - 0.5) * 90;

          setTimeout(() => {
            p.style.transform = `translate(${dx}px, ${dy}px) rotate(${angle}deg) scale(${scale})`;
            p.style.opacity = '0';
          }, i * 3);
        });
      }
    });
  }, { threshold: 0.5 });

  observer.observe(container);
}

// Initialize pixel image blocks
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.pixel-image').forEach(container => {
    const imgUrl = container.getAttribute('data-img');
    generatePixels(container, imgUrl);
  });
});
