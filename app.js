let capsules = JSON.parse(localStorage.getItem("capsules")) || []; //  capsules load karne ke liye ak empty array liya h
let currentUser = {email: "mdtabish103@gmail.com"}; // Current user ka email

const FIXED_IMAGE =
  "https://images.unsplash.com/photo-1737644467636-6b0053476bb2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE0fHx8ZW58MHx8fHx8";
// Dfixed image agar capsule me image na ho our aapn dusre image bhi add kr skte h

function showSection(sectionId) {
  // Sabhi sections ko hide ho jaaye
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.add("hidden"));

  // Jo section chahiye usko dikhayge yha se
  document.getElementById(sectionId).classList.remove("hidden");

  // Agar dashboard hai to user ke capsules load honge
  if (sectionId === "dashboard") loadCapsules();

  // Agar public hai to public capsules load honga
  if (sectionId === "public") loadPublicCapsules();
}

// User ke capsules load aur display kareyge
function loadCapsules() {
  const capsuleList = document.getElementById("capsuleList");
  capsuleList.innerHTML = "";

  // Current user ke capsules filter honge jyse koi our h , aans , tabish , mohit , sohel , etc
  const userCapsules = capsules.filter((c) => c.creator === currentUser.email);

  // Agar koi capsule nahi hai
  if (userCapsules.length === 0) {
    capsuleList.innerHTML = `
      <div class="empty-state">
        <p>You don't have any time capsules yet.</p>
        <p>Create your first one to get started!</p>
      </div>
    `;
    return;
  }

  const now = new Date();
  userCapsules.forEach((capsule) => {
    const li = document.createElement("li");
    const isUnlocked = new Date(capsule.unlockDate) <= now; // Check honga capsule unlocked hai ya nahi

    // Capsule ko html list me dala
    li.innerHTML = `
      <img src="${
        capsule.image || FIXED_IMAGE
      }" alt="capsule image" class="capsule-img" />
      <h3>${capsule.title}</h3>
      <p>${capsule.description}</p>
      <p class="date"><strong>Unlock:</strong> ${new Date(
        capsule.unlockDate
      ).toDateString()}</p>
      <p class="status-badge ${
        isUnlocked ? "status-unlocked" : "status-locked"
      }">
        ${isUnlocked ? "✅ Unlocked" : "🔒 Locked"}
      </p>
      <div class="actions">
        <button onclick="viewCapsule('${capsule.id}')">View</button>
        <button onclick="editCapsule('${capsule.id}')">Edit</button>
        <button class="delete" onclick="deleteCapsule('${
          capsule.id
        }')">Delete</button>
      </div>
    `;
    capsuleList.appendChild(li);
  });
}

// Public capsules load ho rha h
function loadPublicCapsules() {
  const publicList = document.getElementById("publicCapsuleList");
  publicList.innerHTML = "";

  const now = new Date();
  // sirf whi public capsule jisko unlock kr diya h
  const publicCapsules = capsules.filter(
    (capsule) => capsule.isPublic && new Date(capsule.unlockDate) <= now
  );

  if (publicCapsules.length === 0) {
    publicList.innerHTML = `
      <div class="empty-state">
        <p>No public capsules available yet.</p>
        <p>Check back later or create your own public capsule!</p>
      </div>
    `;
    return;
  }

  publicCapsules.forEach((capsule) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${
        capsule.image || FIXED_IMAGE
      }" alt="capsule image" class="capsule-img" />
      <h3>${capsule.title}</h3>
      <p>${capsule.description}</p>
      <p class="date">Unlocked: ${new Date(
        capsule.unlockDate
      ).toDateString()}</p>
      <div class="actions">
        <button onclick="viewCapsule('${capsule.id}')">View Details</button>
      </div>
    `;
    publicList.appendChild(li);
  });
}

// Capsule create karne ka form submit event h yee
document.getElementById("capsuleForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;

  // New capsule object benga yha ses
  const capsule = {
    id: Date.now().toString(),
    title: form.title.value,
    description: form.description.value,
    unlockDate: form.unlockDate.value,
    isPublic: form.isPublic.checked,
    creator: currentUser.email,
    media: [],
    image: FIXED_IMAGE,
    createdAt: new Date().toISOString(),
  };

  // Capsule ko list me add karo aur localStorage me save karega
  capsules.push(capsule);
  localStorage.setItem("capsules", JSON.stringify(capsules));

  alert("Time capsule created successfully!"); // Success message
  form.reset();
  showSection("dashboard"); // Dashboard pe wapis se leke jaayga
});

// Capsule details dekhayaga yha se
function viewCapsule(id) {
  const capsule = capsules.find((c) => c.id === id);
  if (!capsule) return;

  const now = new Date();
  const isUnlocked = new Date(capsule.unlockDate) <= now;

  // Capsule details set honga
  document.getElementById("capsuleTitle").textContent = capsule.title;
  document.getElementById("capsuleDescription").textContent =
    capsule.description;
  document.getElementById(
    "capsuleUnlockDate"
  ).textContent = `Unlock Date: ${new Date(capsule.unlockDate).toDateString()}`;

  if (isUnlocked) {
    // Agar unlocked hai to media show karega
    document.getElementById("capsuleMedia").innerHTML = `
      <img src="${
        capsule.image || FIXED_IMAGE
      }" alt="capsule image" class="capsule-img-large" />
      <p>📂 Media: (Simulated content)</p>
      ${
        capsule.media.length
          ? `<p>Contains ${capsule.media.length} media items</p>`
          : ""
      }
    `;
  } else {
    // Agar locked hai to countdown show karo
    document.getElementById("capsuleMedia").innerHTML = `
      <div class="locked-container">
        <div class="locked-icon">🔒</div>
        <p>This capsule is locked until the unlock date.</p>
        <p class="countdown" id="countdown-${capsule.id}"></p>
      </div>
    `;
    updateCountdown(capsule.id, capsule.unlockDate); // Countdown start karna
  }

  showSection("capsuleView");
}

// Countdown timer update karna
function updateCountdown(id, unlockDate) {
  const countdownElement = document.getElementById(`countdown-${id}`);
  if (!countdownElement) return;

  const unlockTime = new Date(unlockDate).getTime();
  const now = new Date().getTime();
  const distance = unlockTime - now;

  if (distance <= 0) {
    countdownElement.textContent = "Capsule is now unlocked!";
    setTimeout(() => viewCapsule(id), 1000); // Refresh ke baad unlock
    return;
  }

  // Days, hours, minutes, seconds calculate kar rha h
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  countdownElement.textContent = `Time remaining: ${days}d ${hours}h ${minutes}m ${seconds}s`;

  setTimeout(() => updateCountdown(id, unlockDate), 1000); // Har second update honga
}

// Capsule edit krna h to yha se honga
function editCapsule(id) {
  const capsule = capsules.find((c) => c.id === id);
  if (!capsule) return;

  const form = document.getElementById("editForm");
  form.title.value = capsule.title;
  form.description.value = capsule.description;
  form.unlockDate.value = capsule.unlockDate;
  form.isPublic.checked = capsule.isPublic;

  form.onsubmit = function (e) {
    e.preventDefault();
    // Values update kiya h
    capsule.title = e.target.title.value;
    capsule.description = e.target.description.value;
    capsule.unlockDate = e.target.unlockDate.value;
    capsule.isPublic = e.target.isPublic.checked;

    localStorage.setItem("capsules", JSON.stringify(capsules));
    alert("Time capsule updated successfully!");
    showSection("dashboard");
  };

  showSection("edit");
}

// Capsule delete hona yha se
function deleteCapsule(id) {
  if (
    !confirm(
      "Are you sure you want to delete this time capsule? This action cannot be undone."
    )
  ) {
    return;
  }

  capsules = capsules.filter((c) => c.id !== id); // Capsule remove karne pe
  localStorage.setItem("capsules", JSON.stringify(capsules));
  alert("Time capsule deleted successfully!");
  loadCapsules();
}

// Logout function
function logout() {
  if (!confirm("Are you sure you want to logout?")) {
    return;
  }

  currentUser = {email: "mdtabish103@gmail.com"}; // Logout ke baad bhi same user rakha h
  showSection("dashboard");
}

// App ko initialize karna
showSection("dashboard");

// Keyboard shortcuts add
document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.key === "1") {
    e.preventDefault();
    showSection("dashboard");
  } else if (e.ctrlKey && e.key === "2") {
    e.preventDefault();
    showSection("create");
  } else if (e.ctrlKey && e.key === "3") {
    e.preventDefault();
    showSection("public");
  } else if (e.key === "Escape") {
    if (!document.getElementById("dashboard").classList.contains("hidden")) {
      return;
    }
    e.preventDefault();
    showSection("dashboard");
  }
});

// Offline support ke liye service worker register
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js").then(
      function (registration) {
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope
        );
      },
      function (err) {
        console.log("ServiceWorker registration failed: ", err);
      }
    );
  });
}
