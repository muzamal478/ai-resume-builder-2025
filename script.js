// Initialize jsPDF
const { jsPDF } = window.jspdf;

// Tab Navigation
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Remove active class from all buttons
    tabButtons.forEach(btn => btn.classList.remove('active'));
    // Hide all tab contents
    tabContents.forEach(content => content.classList.add('hidden'));
    // Add active class to clicked button
    button.classList.add('active');
    // Show corresponding tab content
    document.getElementById(button.dataset.tab).classList.remove('hidden');
  });
});

// Mock Gemini API (replace with real API in production)
async function callGeminiAPI(prompt) {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer YOUR_API_KEY`
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// Generate AI Summary
document.getElementById('generate-summary').addEventListener('click', async () => {
  const hardSkills = document.getElementById('hard-skills').value;
  const softSkills = document.getElementById('soft-skills').value;
  const prompt = `Generate a professional resume summary based on these skills: Hard Skills - ${hardSkills}, Soft Skills - ${softSkills}`;

  try {
    const summary = await callGeminiAPI(prompt);
    document.getElementById('ai-summary').value = summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    document.getElementById('ai-summary').value = 'Error generating summary. Please try again.';
  }
});

// Handle Image Upload
let profileImageData = '';
document.getElementById('profile-image').addEventListener('change', event => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      profileImageData = e.target.result;
      updatePreview(); // Update preview with image
    };
    reader.readAsDataURL(file);
  }
});

// Form Submission and Real-Time Preview
const form = document.getElementById('resume-form');
const previewSection = document.getElementById('preview-section');
const previewContent = document.getElementById('preview-content');

function updatePreview() {
  const data = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    summary: document.getElementById('summary').value,
    education: document.getElementById('education-details').value,
    experience: document.getElementById('experience-details').value,
    hardSkills: document.getElementById('hard-skills').value,
    softSkills: document.getElementById('soft-skills').value,
    certifications: document.getElementById('certifications').value,
    languages: document.getElementById('languages').value,
    interests: document.getElementById('interests').value,
    aiSummary: document.getElementById('ai-summary').value,
  };

  previewContent.innerHTML = `
    <div class="mb-6">
      ${profileImageData ? `<img src="${profileImageData}" alt="Profile" class="w-32 h-32 rounded-full mx-auto mb-4">` : ''}
      <h3 class="text-2xl font-bold text-center">${data.name || 'Your Name'}</h3>
      <p class="text-center">${data.email || 'email@example.com'} | ${data.phone || 'Phone'} | ${data.address || 'Address'}</p>
    </div>
    ${data.aiSummary ? `
      <div class="mb-6">
        <h4 class="text-lg font-semibold mb-2">Professional Summary</h4>
        <p>${data.aiSummary}</p>
      </div>
    ` : ''}
    ${data.summary ? `
      <div class="mb-6">
        <h4 class="text-lg font-semibold mb-2">Personal Summary</h4>
        <p>${data.summary}</p>
      </div>
    ` : ''}
    ${data.education ? `
      <div class="mb-6">
        <h4 class="text-lg font square mb-2">Education</h4>
        <p>${data.education.replace(/\n/g, '<br>')}</p>
      </div>
    ` : ''}
    ${(data.hardSkills || data.softSkills) ? `
      <div class="mb-6">
        <h4 class="text-lg font-semibold mb-2">Skills</h4>
        ${data.hardSkills ? `<p><strong>Hard Skills:</strong> ${data.hardSkills}</p>` : ''}
        ${data.softSkills ? `<p><strong>Soft Skills:</strong> ${data.softSkills}</p>` : ''}
      </div>
    ` : ''}
    ${data.experience ? `
      <div class="mb-6">
        <h4 class="text-lg font-semibold mb-2">Work Experience</h4>
        <p>${data.experience.replace(/\n/g, '<br>')}</p>
      </div>
    ` : ''}
    ${data.certifications ? `
      <div class="mb-6">
        <h4 class="text-lg font-semibold mb-2">Certifications</h4>
        <p>${data.certifications}</p>
      </div>
    ` : ''}
    ${data.languages ? `
      <div class="mb-6">
        <h4 class="text-lg font-semibold mb-2">Languages</h4>
        <p>${data.languages}</p>
      </div>
    ` : ''}
    ${data.interests ? `
      <div>
        <h4 class="text-lg font-semibold mb-2">Interests</h4>
        <p>${data.interests}</p>
      </div>
    ` : ''}
  `;

  previewSection.classList.remove('hidden');
}

// Real-Time Updates
form.querySelectorAll('input, textarea').forEach(input => {
  input.addEventListener('input', updatePreview);
});

form.addEventListener('submit', e => {
  e.preventDefault();
  updatePreview();
});

// Copy to Clipboard
document.getElementById('copy-resume').addEventListener('click', () => {
  const text = previewContent.innerText;
  navigator.clipboard.writeText(text).then(() => {
    alert('Resume copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy resume.');
  });
});

// Email Resume
document.getElementById('email-resume').addEventListener('click', () => {
  const text = encodeURIComponent(previewContent.innerText);
  const subject = encodeURIComponent('My Professional Resume');
  window.location.href = `mailto:?subject=${subject}&body=${text}`;
});

// Download PDF
document.getElementById('download-pdf').addEventListener('click', () => {
  const doc = new jsPDF();
  const content = previewContent.innerText;
  doc.setFontSize(12);
  doc.text(content, 10, 10);
  doc.save('resume.pdf');
});

// Initialize Preview
updatePreview();
