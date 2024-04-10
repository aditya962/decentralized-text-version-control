import React, { useState, useEffect } from "react";
import Web3 from "web3";
import VersionControlContract from "./contracts/VersionControl.json"; // Updated contract JSON file name
import { create } from "ipfs-http-client";
import "./App.css"; // Import CSS file
import RetrieveTextFromIPFS from "./sample";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [text, setText] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");
  const [numVersions, setNumVersions] = useState(0);
  const [versionIndex, setVersionIndex] = useState(0);
  const [versions, setVersions] = useState([]);

  const ipfs = create({ host: "localhost", port: 5037, protocol: "http" });

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        try {
          await window.ethereum.enable();
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
        } catch (error) {
          console.error(error);
        }
      }
    };

    initWeb3();
  }, []);

  useEffect(() => {
    const initContract = async () => {
      if (web3) {
        try {
          const networkId = await web3.eth.net.getId();
          const deployedNetwork = VersionControlContract.networks[networkId];
          if (deployedNetwork) {
            const instance = new web3.eth.Contract(VersionControlContract.abi, deployedNetwork.address);
            setContract(instance);
            const num = await instance.methods.getNumVersions(account).call();
            setNumVersions(parseInt(num));
            const textVersions = [];
            for (let i = 0; i < num; i++) {
              const version = await instance.methods.getTextVersion(account, i).call();
              textVersions.push(version);
            }
            setVersions(textVersions);
          } else {
            console.error("Contract not deployed on this network.");
          }
        } catch (error) {
          console.error(error);
        }
      }
    };

    initContract();
  }, [web3, account]);

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleSaveText = async () => {
    try {
      const result = await ipfs.add(text);
      setIpfsHash(result.path);
      if (contract) {
        await contract.methods.saveText(result.path).send({ from: account });
        setNumVersions(numVersions + 1);
        setVersions([...versions, { ipfsHash: result.path, timestamp: Date.now() }]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // const handleVersionChange = (index) => {
  //   setVersionIndex(index);
  //   setText(versions[index].ipfsHash);
  // };
  // const handleVersionChange = async (index) => {
  //   setVersionIndex(index);
  //   try {
  //     const versionText = ipfs.cat(versions[index].ipfsHash);
  //     setText(versionText.toString());
  //     console.log(versionText);
  //     console.log(text);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  const handleVersionChange = async (index) => {
    setVersionIndex(index);
    try {
      const versionText = await ipfs.cat(versions[index].ipfsHash); // Wait for the async generator to resolve
      let text = ""; // Initialize an empty string to store the concatenated text
      for await (const chunk of versionText) {
        // Iterate over the async generator
        text += new TextDecoder().decode(chunk);
        console.log("Chunk of text:", chunk.toString()); // Log each chunk of text
      }
      setText(text); // Update the state with the concatenated text
      console.log(text);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    // second
    <>
      {/* <div>
        <h2>My Other Component</h2>
        <RetrieveTextFromIPFS />
      </div> */}
      <div className="container">
        <div className="description">
          <h1 className="title">IPFS Text Version Control</h1>
          <p>This is an application that allows you to store and retrieve text versions using IPFS and Ethereum blockchain.</p>
        </div>
        <h2>Text Area</h2>
        <div className="editor-container">
          <textarea className="editor" value={text} onChange={handleTextChange} />
        </div>
        <button className="button" onClick={handleSaveText}>
          Save Text
        </button>
        <button className="button" disabled={versionIndex === 0} onClick={() => handleVersionChange(versionIndex - 1)}>
          Previous Version
        </button>
        <button className="button" disabled={versionIndex === numVersions - 1} onClick={() => handleVersionChange(versionIndex + 1)}>
          Next Version
        </button>
        <h2>Versions:</h2>
        <ul>
          {versions.map((version, index) => (
            <li key={index} onClick={() => handleVersionChange(index)}>
              Version {index}: {version.ipfsHash}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default App;
