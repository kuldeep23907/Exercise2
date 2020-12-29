import React, { useState, useEffect } from "react";
import LotteryContract from "./contracts/Lottery.json";
import getWeb3 from "./getWeb3";

import "./App.css";

const App = () =>  {

  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [amount, setAmount] = useState(0);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setup();
  }, []);


  const setup = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = LotteryContract.networks[networkId];
      const instance = new web3.eth.Contract(
        LotteryContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      console.log(instance);
      setWeb3(web3);
      setAccounts(accounts);
      setContract(instance);
      setAmount(await instance.methods.amount().call());

      window.ethereum.on("accountsChanged", async ([selectedAccount]) => {
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
      });

    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
    }
  };

  const bet = async() => {
    let b = await contract.methods.bet().send({from:accounts[0], value:amount*(10**18)});
    console.log(b);
  }

  const result = async() => {
    let r = await contract.methods.result().send({from:accounts[0]});
    console.log(r);
  }

  const getAllData = async() => {
    const logs = await web3.eth.getPastLogs({
      address: [contract.options.address],
      fromBlock: 1,
      toBlock: 'latest',
      topics:["0xeed8753ac0be89634ca92c470f66ddb597c1f37844aeb4dbae447fc81020b111"]
    });
    console.log(logs);

    let addresses = [];
    let volume = {};
    logs.forEach((log) => {
      const CA = log['topics'][1];
      let check = addresses.filter((adr) => adr === CA);
      if(check.length === 0){
        addresses.push(CA);
      }

      let checkV = Object.keys(volume).filter((adr) => adr === CA);
      if(checkV.length) {
        volume[CA] =  volume[CA] + 1;
      } else {
        volume[CA] = 1;
      }
    })
    console.log(addresses, "***addresses");
    console.log(volume, "***volume");
  }

  if (!web3) {
    return (<div>Loading Web3, accounts, and contract...</div>);
  }
  return (
    <div className="App">
      <h1>Lottery Dapp</h1>
      <h2>
        Current Account: {accounts[0]}
      </h2>
      <h3>
        Amount to bet : {amount} ETH
      </h3>
      <div>
        <button onClick={bet}> Bet </button>
        <button style={{marginLeft:'2rem'}} onClick={result}>Result</button>
        <button style={{marginLeft:'2rem'}} onClick={getAllData}>Data</button>

      </div>

      <div>
       {
         users.map((user) => {
           return(
           <p>{user}</p>
           )
         })
       }
      </div>
    </div>
  );
}

export default App;
