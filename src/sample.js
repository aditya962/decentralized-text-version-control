import React, { useState } from "react";
import axios from "axios";

const RetrieveTextFromIPFS = () => {
  const [hash, setHash] = useState("");
  const [retrievedText, setRetrievedText] = useState("");
  const [error, setError] = useState("");

  const retrieveTextFromIPFS = async () => {
    try {
      const response = await axios.get(`http://localhost:5037/api/v0/cat?arg=${hash}`);
      setRetrievedText(response.data);
      setError("");
    } catch (error) {
      setError("Error retrieving text from IPFS");
      setRetrievedText("");
    }
  };

  return (
    <div>
      <input type="text" value={hash} onChange={(e) => setHash(e.target.value)} />
      <button onClick={retrieveTextFromIPFS}>Retrieve Text</button>
      {error && <p>{error}</p>}
      {retrievedText && <p>Retrieved text: {retrievedText}</p>}
    </div>
  );
};

export default RetrieveTextFromIPFS;
