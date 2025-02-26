// Add this at the top of the file
// localStorage.removeItem('token');

// Temporary user ID for testing
// const TEST_USER_ID = 1;

// Add these variables at the top of the file
// let currentGuildId = null;
// let currentGuildLeaderId = null;

// Add these utility functions at the top of the file
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Add this function at the top to check admin status
function isAdmin() {
    return localStorage.getItem('role') === 'admin';
}

// Add this function to handle UI permissions
function setupUIPermissions() {
    const createGuildSection = document.getElementById('createGuildSection');
    if (isAdmin()) {
        createGuildSection.style.display = 'block';
    } else {
        createGuildSection.style.display = 'none';
    }
}

// Update the createGuild function to check for admin role
async function createGuild() {
    if (!isAdmin()) {
        alert('Only administrators can create guilds');
        return;
    }

    const token = localStorage.getItem('token');
    console.log('Creating guild, token:', token ? 'exists' : 'missing');
    
    if (!token) {
        console.log('No token found in createGuild');
        window.location.href = '/login.html';
        return;
    }

    const name = document.getElementById('guildName').value;
    const password = document.getElementById('guildPassword').value;
    const description = document.getElementById('guildDescription').value;

    try {
        const response = await fetch('/api/guild/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                password,
                description
            })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Guild created successfully!');
            refreshGuilds();
        } else {
            console.error('Guild creation failed:', data.error);
            if (response.status === 401) {
                // Only redirect if it's an authentication error
                window.location.href = '/login.html';
            } else {
                alert('Error: ' + data.error);
            }
        }
    } catch (error) {
        console.error('Error creating guild:', error);
        alert('Error creating guild: ' + error);
    }
}

async function joinGuild() {
    const guildId = document.getElementById('guildId').value;
    const password = document.getElementById('joinPassword').value;
    const token = localStorage.getItem('token');

    if (!guildId) {
        alert('Please enter a Guild ID');
        return;
    }

    if (!password) {
        alert('Please enter the Guild password');
        return;
    }

    console.log('Attempting to join guild:', { guildId }); // Add logging

    try {
        const response = await fetch('/api/guild/join', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                guildId: parseInt(guildId), // Ensure guildId is a number
                password
            })
        });

        const data = await response.json();
        console.log('Join guild response:', data); // Add logging

        if (response.ok) {
            alert('Successfully joined guild!');
            refreshGuilds();
            // Clear the form
            document.getElementById('guildId').value = '';
            document.getElementById('joinPassword').value = '';
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Join guild error:', error); // Add logging
        alert('Error joining guild: ' + error);
    }
}

async function leaveGuild() {
    const guildId = document.getElementById('guildId').value;

    try {
        const response = await fetch('/api/guild/leave', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                guildId,
                userId: TEST_USER_ID
            })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Successfully left guild!');
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error leaving guild: ' + error);
    }
}

// Update the viewGuildDetails function to store guild infol
async function viewGuildDetails(guildId) {
    try {
        const response = await fetch(`/api/guild/details/${guildId}`);
        const data = await response.json();
        
        if (response.ok) {
            // currentGuildId = data.guild.id;
            // currentGuildLeaderId = data.guild.leader_id;
            
            const modal = document.getElementById('guildDetailsModal');
            const content = document.getElementById('guildDetailsContent');
            const deleteBtn = document.getElementById('deleteGuildBtn');
            
            content.innerHTML = `
                <h4>${data.guild.name}</h4>
                <p><strong>Description:</strong> ${data.guild.description || 'No description'}</p>
                <p><strong>Created:</strong> ${new Date(data.guild.created_at).toLocaleDateString()}</p>
                <div class="member-list">
                    <h5>Members (${data.members.length})</h5>
                    <ul>
                        ${data.members.map(member => `
                            <li>User ${member.user_id} - Joined: ${new Date(member.join_date).toLocaleDateString()}</li>
                        `).join('')}
                    </ul>
                </div>
            `;
            
            // Show delete button only for guild leader
            // deleteBtn.style.display = currentGuildLeaderId === TEST_USER_ID ? 'block' : 'none';
            
            modal.style.display = 'block';
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error fetching guild details: ' + error);
    }
}

// Add the deleteGuild function
async function deleteGuild() {
    if (!currentGuildId) return;
    
    if (!confirm('Are you sure you want to delete this guild? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/guild/delete/${currentGuildId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: TEST_USER_ID
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Guild successfully deleted');
            document.getElementById('guildDetailsModal').style.display = 'none';
            refreshGuilds(); // Refresh the guilds list
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error deleting guild: ' + error);
    }
}

// Update the refreshGuilds function to use the new modal
async function refreshGuilds() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/guild/all', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (response.ok) {
            const guildsList = document.getElementById('guildsList');
            guildsList.innerHTML = '';
            
            data.guilds.forEach(guild => {
                const guildElement = document.createElement('div');
                guildElement.className = 'guild-item';
                guildElement.innerHTML = `
                    <h4>${guild.name}</h4>
                    <p>Leader: ${guild.leader_name}</p>
                    <p>Members: ${guild.member_count}</p>
                    <p>Created: ${new Date(guild.created_at).toLocaleDateString()}</p>
                    <p>ID: ${guild.id}</p>
                    <button onclick="viewGuildMembers(${guild.id})" class="primary-button">View Members</button>
                `;
                guildsList.appendChild(guildElement);
            });
        }
    } catch (error) {
        console.error('Error loading guilds:', error);
        alert('Error loading guilds: ' + error);
    }
}

// Add event listeners for modal close buttons
document.addEventListener('DOMContentLoaded', () => {
    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };

    // Close modal when clicking X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.onclick = function() {
            this.closest('.modal').style.display = 'none';
        };
    });

    // Add event listener to setup permissions when page loads
    setupUIPermissions();
    refreshGuilds();
});

// Update the viewGuildMembers function
async function viewGuildMembers(guildId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/guild/${guildId}/members`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (response.ok) {
            const membersListHtml = data.members.map(member => `
                <div class="member-item">
                    <span>${member.username}</span>
                    <span>Joined: ${new Date(member.join_date).toLocaleDateString()}</span>
                    ${member.is_leader ? '<span class="leader-badge">Leader</span>' : ''}
                    ${!member.is_leader ? 
                        `<button onclick="kickMember(${guildId}, ${member.user_id})" class="danger-button">Kick</button>` 
                        : ''}
                </div>
            `).join('');

            // Update the modal content
            const content = document.getElementById('guildMembersContent');
            content.innerHTML = `
                <div class="guild-members-list">
                    <h4>Guild Members</h4>
                    ${membersListHtml}
                </div>
                <div class="add-member-section">
                    <h4>Add Member</h4>
                    <input type="text" id="newMemberUsername" placeholder="Username">
                    <button onclick="addMember(${guildId})" class="primary-button">Add Member</button>
                </div>
            `;

            // Open the modal
            openModal('guildMembersModal');
        } else {
            console.error('Error fetching members:', data.error);
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error fetching guild members:', error);
        alert('Error fetching guild members: ' + error);
    }
}

async function kickMember(guildId, userId) {
    if (!confirm('Are you sure you want to kick this member?')) {
        return;
    }

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/guild/${guildId}/kick`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Member kicked successfully');
            viewGuildMembers(guildId); // Refresh the members list
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error kicking member:', error);
        alert('Error kicking member: ' + error);
    }
}

async function addMember(guildId) {
    const username = document.getElementById('newMemberUsername').value;
    if (!username) {
        alert('Please enter a username');
        return;
    }

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/guild/${guildId}/add-member`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Member added successfully');
            viewGuildMembers(guildId); // Refresh the members list
            document.getElementById('newMemberUsername').value = ''; // Clear input
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error adding member:', error);
        alert('Error adding member: ' + error);
    }
} 