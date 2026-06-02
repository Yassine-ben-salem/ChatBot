import { useState, useEffect } from "react";

function App() {
  const [messgae, setMessage] = useState("");
  useEffect(() => {
    fetch("/api/hello")
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error("Error fetching message:", error));
  }, []);
  return <p>{messgae}</p>;
}

export default App;
