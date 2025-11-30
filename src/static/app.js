document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and previous options to avoid duplicates
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Ensure participants is an array and remove duplicates for display
        const participants = Array.isArray(details.participants) ? [...new Set(details.participants)] : [];

        // Build static part of the card
        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Create participants section
        const participantsSection = document.createElement('div');
        participantsSection.className = 'participants-section';

        const header = document.createElement('h5');
        header.textContent = `Participants (${participants.length})`;
        participantsSection.appendChild(header);

        if (participants.length === 0) {
          const p = document.createElement('p');
          p.className = 'info';
          p.textContent = 'No participants yet';
          participantsSection.appendChild(p);
        } else {
          const ul = document.createElement('ul');
          ul.className = 'participants-list';

          participants.forEach((pEmail) => {
            const li = document.createElement('li');
            li.className = 'participant-item';

            const span = document.createElement('span');
            span.textContent = pEmail;

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'participant-remove';
            removeBtn.setAttribute('aria-label', `Remove ${pEmail}`);
            removeBtn.innerHTML = '&times;';

            // Click handler to unregister participant
            removeBtn.addEventListener('click', async () => {
              // optimistic UI disabled: call API and refresh on success
              try {
                const res = await fetch(`/activities/${encodeURIComponent(name)}/participants?email=${encodeURIComponent(pEmail)}`, { method: 'DELETE' });
                const data = await res.json();
                if (res.ok) {
                  messageDiv.textContent = data.message || 'Participant removed';
                  messageDiv.className = 'success';
                  messageDiv.classList.remove('hidden');
                  // Refresh the list
                  fetchActivities();
                } else {
                  messageDiv.textContent = data.detail || 'Failed to remove participant';
                  messageDiv.className = 'error';
                  messageDiv.classList.remove('hidden');
                }
                setTimeout(() => messageDiv.classList.add('hidden'), 4000);
              } catch (err) {
                console.error('Error removing participant:', err);
                messageDiv.textContent = 'Failed to remove participant';
                messageDiv.className = 'error';
                messageDiv.classList.remove('hidden');
                setTimeout(() => messageDiv.classList.add('hidden'), 4000);
              }
            });

            li.appendChild(span);
            li.appendChild(removeBtn);
            ul.appendChild(li);
          });

          participantsSection.appendChild(ul);
        }

        activityCard.appendChild(participantsSection);
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
