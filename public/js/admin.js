document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
    if (role !== 'admin') {
        alert('You do not have admin privileges');
        window.location.href = '/login.html';
        return;
    }

    // Load users list
    await loadUsers();
    
    // Load parents and students for the parent-child relationship section
    await loadParentsAndStudents();
    
    // Load existing parent-child relationships
    await loadRelationships();
});

async function loadUsers() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/auth/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Not authorized');
        }

        const data = await response.json();
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';
        
        data.users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.username}</td>
                <td>
                    <select onchange="updateUserRole(${user.id}, this.value)">
                        <option value="student" ${user.role === 'student' ? 'selected' : ''}>Student</option>
                        <option value="parent" ${user.role === 'parent' ? 'selected' : ''}>Parent</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>${user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
                <td>
                    <button onclick="deleteUser(${user.id})" class="danger-button">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        alert('Error loading users: ' + error);
        window.location.href = '/login.html';
    }
}

async function loadParentsAndStudents() {
    const token = localStorage.getItem('token');
    try {
        // Load parents
        const parentsResponse = await fetch('/api/auth/parents', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!parentsResponse.ok) {
            throw new Error('Failed to load parents');
        }

        const parentsData = await parentsResponse.json();
        const parentSelect = document.getElementById('parentSelect');
        parentSelect.innerHTML = '<option value="">Select a parent</option>';
        
        parentsData.parents.forEach(parent => {
            const option = document.createElement('option');
            option.value = parent.id;
            option.textContent = parent.username;
            parentSelect.appendChild(option);
        });

        // Load students
        const studentsResponse = await fetch('/api/auth/students', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!studentsResponse.ok) {
            throw new Error('Failed to load students');
        }

        const studentsData = await studentsResponse.json();
        const childSelect = document.getElementById('childSelect');
        childSelect.innerHTML = '<option value="">Select a student</option>';
        
        studentsData.students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = student.username;
            childSelect.appendChild(option);
        });
    } catch (error) {
        alert('Error loading parents and students: ' + error);
    }
}

async function loadRelationships() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/auth/parent-child-relationships', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load relationships');
        }

        const data = await response.json();
        const tbody = document.querySelector('#relationshipsTable tbody');
        tbody.innerHTML = '';
        
        data.relationships.forEach(rel => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${rel.parent_username}</td>
                <td>${rel.child_username}</td>
                <td>${new Date(rel.created_at).toLocaleDateString()}</td>
                <td>
                    <button onclick="removeRelationship(${rel.parent_id}, ${rel.child_id})" class="danger-button">Remove</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        alert('Error loading relationships: ' + error);
    }
}

async function assignChild() {
    const token = localStorage.getItem('token');
    const parentId = document.getElementById('parentSelect').value;
    const childId = document.getElementById('childSelect').value;
    
    if (!parentId || !childId) {
        alert('Please select both a parent and a child');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/assign-child', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ parentId, childId })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Child assigned to parent successfully');
            // Refresh the relationships list
            loadRelationships();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error assigning child: ' + error);
    }
}

async function removeRelationship(parentId, childId) {
    if (!confirm('Are you sure you want to remove this relationship?')) {
        return;
    }
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/auth/remove-child', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ parentId, childId })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Relationship removed successfully');
            // Refresh the relationships list
            loadRelationships();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error removing relationship: ' + error);
    }
}

async function updateUserRole(userId, newRole) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/auth/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: newRole })
        });

        if (!response.ok) {
            throw new Error('Failed to update role');
        }

        alert('User role updated successfully');
        // Reload users, parents, and students lists
        loadUsers();
        loadParentsAndStudents();
    } catch (error) {
        alert('Error updating role: ' + error);
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/auth/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        alert('User deleted successfully');
        // Reload all data
        loadUsers();
        loadParentsAndStudents();
        loadRelationships();
    } catch (error) {
        alert('Error deleting user: ' + error);
    }
} 