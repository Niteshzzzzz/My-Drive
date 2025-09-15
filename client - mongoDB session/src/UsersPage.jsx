import { useEffect, useState } from 'react';
import './UsersPage.css';
import { BASE_URL } from './components/DirectoryHeader';
import { useNavigate } from 'react-router-dom';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate()
    const [userName, setUserName] = useState("Guest User");
  const [userEmail, setUserEmail] = useState("guest@example.com");
  const [userRole, setUserRole] = useState("User");

  const logoutUser = async (user) => {
    const {id, email} = user
    const isConfirm = confirm(`Are you sure to logout ${email}`)
    if(!isConfirm) return;
    try {
      const response = await fetch(`${BASE_URL}/user/${id}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        console.log("Logged out successfully");
        fetchUsers()
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };
  
  const deleteUser = async (user) => {
    const {id, email} = user
    const isConfirm = confirm(`Are you sure to delete ${email}`)
    if(!isConfirm) return;
    try {
      const response = await fetch(`${BASE_URL}/user/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        console.log("User deleted out successfully");
        fetchUsers()
      } else {
        console.error("Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const response = await fetch(`${BASE_URL}/users`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        // Set user info if logged in
        setUsers(data)
      } else if (response.status === 403) {
        navigate('/')
      } else if (response.status === 401) {
        // User not logged in
        navigate('/login')
      }
      else {
        // Handle other error statuses if needed
        console.error("Error fetching user info:", response.status);
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  }

  async function fetchUser() {
    try {
      const response = await fetch(`${BASE_URL}/user`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        // Set user info if logged in
        setUserName(data.name);
        setUserEmail(data.email);
        setUserRole(data.role)
      } else if (response.status === 401) {
        // User not logged in
        navigate('/login')
      } else {
        // Handle other error statuses if needed
        console.error("Error fetching user info:", response.status);
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  }


  return (
    <div className="users-container">
      <h1 className="title">All Users</h1>
      <h3>{userName}: ({userRole})</h3>
      
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th></th>
            { userRole == 'Admin' && <th></th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.isLoggedIn ? 'Logged In' : 'Logged Out'}</td>
              <td>
                <button
                  className="logout-button"
                  onClick={() => logoutUser(user)}
                  disabled={!user.isLoggedIn}
                >
                  Logout
                </button>
              </td>
              { userRole == 'Admin' && <td>
                <button
                  className="logout-button delete-btn"
                  onClick={() => deleteUser(user)}
                  disabled={userEmail === user.email}
                >
                  Delete
                </button>
              </td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
