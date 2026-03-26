import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DirectoryView from "./DirectoryView";
import Register from "./Register";
import "./App.css";
import Login from "./Login";
import UsersPage from "./UsersPage";
import Error from "./components/Error";
import Converter from "./components/Converter";
import Plans from "./Plans";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DirectoryView />,
  },
  {
    path: "/converter",
    element: <Converter />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/users",
    element: <UsersPage />,
  },
  {
    path: "/directory/:dirId",
    element: <DirectoryView />,
  },
  {
    path: "/error",
    element: <Error />
  },
  {
    path: "/plans",
    element: <Plans />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
