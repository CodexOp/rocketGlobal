import './App.css';
import bag from './images/bag.png'
import * as React from 'react';
import { ethers, providers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import values from "./values.json"
import stakingAbi from './abi/staking.json';
import tokenAbi from './abi/token.json';

function App() {

  let [connectedWallet, setConnectedWallet] = React.useState(false);
  let [walletAddress, setWalletAddress] = React.useState("Connect");
  let [poolId, setPoolId] = React.useState(2);
  let [poolInfo, setPoolInfo] = React.useState([0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  let [userInfo, setUserInfo] = React.useState([0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  let [whitelistedAddresses, setWalletAddresses] = React.useState([0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  let [amount, setAmount] = React.useState(0);
  let [balance, setBalance] = React.useState(0);
  let [stakingBalance, setStackingBalance] = React.useState(0);
  let [currentPoolSize, setCurrentPoolSize] = React.useState(0);
  let [timeLock, setTimeLock] = React.useState(0);

  const poolData= [
    {name: "DIAMOND",apy: "120", lock:"90", maxStake: "200,000", fee: "25", maxPool:"15m"},
    {name: "GOLD",apy: "60", lock:"60", maxStake: "1,000,000", fee: "25", maxPool:"20m"},
    {name: "BRONZE",apy: "20", lock:"30", maxStake: "2,000,000", fee: "25", maxPool:"20m"}
  ]

  const logoutstatus = connectedWallet ? 'visible' : 'hidden';
  

  let [_signer, _setSigner]= React.useState(0);
  let [_provider, _setProvider]= React.useState(0);
  const web3ModalRef = React.useRef(); // return the object with key named current


  React.useEffect(() => {
    web3ModalRef.current = new Web3Modal({
      network: "rinkeby",
      cacheProvider: false,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider, // required
          options: {
            rpc: {
              56: values.rpcUrl
            }, // required,
            network: "binance"
          }
        }
      },
    });

    connectWallet();

  }, []);

  React.useEffect(()=>{
    getPoolInfo();
    getUserInfo();
    getWhiteListAddresses();
    
    async function fetch (){
      try{
        let _balance = await _getBalance(values.token, walletAddress);
        console.log("BAlance", _balance);
        setBalance(_balance);
      }catch (err){
        console.log("Error", err);
      }
    }
    fetch();
  }, [_provider, _signer, poolId, walletAddress]);

  async function getPoolInfo (){
    try{
      let rpcUrl = values.rpcUrl;
      let provider_ = new ethers.providers.JsonRpcProvider(rpcUrl);
      let staking = new ethers.Contract(
        values.stakingAddress,
        stakingAbi,
        provider_
      );
      var _poolInfo = await staking.poolInfo(poolId);
      console.log ("Pool Info: ", _poolInfo);
      setPoolInfo(_poolInfo);
      let temp = ethers.utils.formatEther(_poolInfo[2].toString()).toString()
      console.log ("temp: ", temp, " value: ", _poolInfo[2].toString());
      setCurrentPoolSize(temp);
    }catch(err){
      console.log(err);
    }
  }

  async function getUserInfo (){
    try{
      let rpcUrl = values.rpcUrl;
      let provider_ = new ethers.providers.JsonRpcProvider(rpcUrl);
      let staking = new ethers.Contract(
        values.stakingAddress,
        stakingAbi,
        provider_
      );
      let _wallet = _signer.getAddress();      
      let _userInfo = await staking.userInfo( poolId, _wallet);
      console.log ("USER Info: ", _userInfo);
      setStackingBalance(ethers.utils.formatEther(_userInfo[0]).toString())
      setUserInfo(_userInfo);
      let _timestamp = parseInt(_userInfo[1].toString())* 1000;
      let _time = new Date(_timestamp);
      if (_timestamp >0) setTimeLock(_time);
      else setTimeLock("- Not staked yet");
    }catch(err){
      console.log("User error", err);
    }
  }

  async function getWhiteListAddresses (){
    try{
      let rpcUrl = values.rpcUrl;
      let provider_ = new ethers.providers.JsonRpcProvider(rpcUrl);
      let staking = new ethers.Contract(
        values.stakingAddress,
        stakingAbi,
        provider_
      );
      let _wallet = _signer.getAddress();      
      let _wlInfo = await staking.whitelistedAddress( poolId, _wallet);
      console.log ("Whitelist Info: ", _wlInfo);
      setWalletAddresses(_wlInfo);
    }catch(err){
      console.log("User error", err);
    }
  }

  async function stakeTokens () {
    try{
      let staking = new ethers.Contract(
        values.stakingAddress,
        stakingAbi,
        _signer
      );
      let _amount = ethers.utils.parseEther(amount.toString());
      // console.log (_amount)
      let tx = await staking.stakeTokens(poolId, _amount);
      getPoolInfo();
      getUserInfo();
    }catch (error) {
      alert(error.data.message);
      // console.log (error)
    }
  }
  

  async function unstakeTokens () {
    try{
      let staking = new ethers.Contract(
        values.stakingAddress,
        stakingAbi,
        _signer
      );
      let tx = await staking.unstakeTokens(poolId);
    }catch (error) {
      alert(error.data.message);
    }
  }

  async function emergencyWithdraw () {
    try{
      let staking = new ethers.Contract(
        values.stakingAddress,
        stakingAbi,
        _signer
      );
      let tx = await staking.emergencyWithdraw(poolId);
    }catch (error) {
      alert (error.data.message);
    }
  }

  async function approve () {
    try{
      let token = new ethers.Contract(
        values.token,
        tokenAbi,
        _signer
      );
      let _amount = ethers.utils.parseEther("10000000000000000000");
      let tx = await token.approve(values.stakingAddress, _amount);
      stakeTokens()
    }catch (error) {
      // alert(error.data.message);
    }
  }

  async function _getBalance (tokenAddress, accountAddress){
    try {
      let rpcUrl = values.rpcUrl;
      let provider_ = new ethers.providers.JsonRpcProvider(rpcUrl);
      let token = new ethers.Contract(
        tokenAddress,
        tokenAbi,
        provider_
      );
      if (!accountAddress){
        accountAddress = await _signer.getAddress();
      }
      let balance = await token.balanceOf (accountAddress);
      let decimals = await token.decimals();
      decimals = parseInt(decimals.toString());
      balance = ethers.utils.formatUnits(balance, decimals);
      return parseFloat(balance.toString()).toFixed(2);
    } catch (err){
      console.log (err, tokenAddress);
      return 0;
    }
  }

  function disconnectWallet () {
    try{
      
      web3ModalRef.current.clearCachedProvider();
      setConnectedWallet(false);
      setBalance(0);
      setStackingBalance(0);
      setTimeLock(0)
    }catch(err){
      console.log(err);
    }
  }

  const onclickhandlers = (e) => { 
    console.log(e.target.value);
    setPoolId(parseInt(e.target.value));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    if (name === "tokenAmount") setAmount(value);
  }


  const connectWallet = async () => {
    try {
      if (!connectedWallet) await getSignerOrProvider(true);
      else disconnectWallet();
    } catch (error) {
      console.log(" error Bhai", error);
    }
  };

  const getSignerOrProvider = async (needSigner = false) => {
    try{
      const _provider = new providers.JsonRpcProvider(values.rpcUrl);
      _setProvider(_provider);
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);
      const { chainId } = await web3Provider.getNetwork();
      console.log ("ChainId: ", chainId);
      // if (chainId !== 4) {
      //   alert("USE RINKEEBY NETWORK");
      //   throw new Error("Change network to Rinkeby");
      // }
      if (needSigner) {
        const signer = web3Provider.getSigner();
        _setSigner(signer)
        let temp = await signer.getAddress();
        setWalletAddress(temp.toString());
      }
      setConnectedWallet(true);
      provider.on("accountsChanged", (accounts) => {
        console.log(accounts);
        connectWallet();
      });
    } catch (error) {
      console.log (error);
      const provider = new providers.JsonRpcProvider(values.rpcUrl);
      _setProvider(provider);
    }
  };
  


  return (
    <div className="rocketglobal">
      <div className='landing'>
        <h2>Rocket Global Staking</h2>
        <p>Get RCKC staking reward when you participate in our high yield staking system.</p>


        <div className='buttons'>
        <div class="w3-dropdown-hover">
    <button onClick={connectWallet}  class="w3-button main_button">{(connectedWallet)? <>{walletAddress.slice(0, 6) + "..."}</>
      :
      <>Connect</>}</button>
    <div class="w3-dropdown-content w3-bar-block w3-border" style={{visibility:`${logoutstatus}`}}>
      <p onClick={connectWallet} className='logout_button'>Logout</p>
    </div>
  </div>
        </div>
      </div>



      {/* Whitelist */}
      {/* <div className='stak_whitelist'>
        <p className='whitelist'>Your Wallet is <span className='whitelist-text'>{`whitlisted`}</span> for this staking, stak your token and earn nasty profit</p>
        </div> */}



      {/* Staking Part */}

    <div className='stak'>
      <div className='header_stak'>
      <div className='content_header_stak'>
        <img src={bag} alt='bag' />
        <p>Stake Now</p>
      </div>
      </div>
      <div className='content_stak'>
        <div className='left_content_stak'>
        <div className='input_box'>
            <div>
            <label>Select Staking Type</label>
            </div>
            <div className='input2'>
            <input type='string' readOnly/>
            <div className='inputpart1'>
              <select onChange={(e)=>onclickhandlers(e)}>

                <option value="2" >Bronze</option>
                <option value="1" >Gold</option>
                <option value="0" >Diamond</option>
              </select>
            </div>
            </div>
          </div>
          <div className='input_box'>
            <div>
            <label>Total Amount</label>
            </div>
            <div className='input2'>
            <input type='string' name= "tokenAmount" onChange={handleChange} value={amount}/>
            <div className='inputpart'>
              <p>RCKC</p>
            </div>
            </div>
            
          </div>
          
          <div className='stak_info'>
          <div className='threebuttons'>
              <button className='stake_first buttons_stake' onClick={approve} >Stake</button>
              <button className='unstake buttons_stake' onClick={unstakeTokens} >UnStake</button>
              <button className='emergency buttons_stake' onClick={emergencyWithdraw} >Emergency Withdraw</button>
            </div>

            <div>
            <label>Your Balance -</label> &nbsp;&nbsp;
            <label className='stak_value'>{parseFloat(balance).toLocaleString()}RCKC</label>
            </div>
            <div>
            <label>Your staking balance -</label> &nbsp;&nbsp;
            <label className='stak_value'>{ stakingBalance} RCKC</label>
            </div>
            <div>
            <label>Reward Expected -</label>&nbsp;&nbsp; 
            <label className='stak_value'>{ (parseFloat(stakingBalance) * parseFloat(poolData[poolId].apy) * parseFloat(poolData[poolId].lock)/365).toFixed(2)} </label>
            </div>
            <div>
            <label>Lock Deadline -</label>&nbsp;&nbsp; 
            <label className='stak_value'>{ timeLock.toString()} </label>
            </div>
            <div>
            <label>Pool Collections -</label>&nbsp;&nbsp; 
            <label className='stak_value'>{ parseFloat(currentPoolSize).toLocaleString()} RCKC</label>
            </div>
            <div>
            <label>Maximum Amount For Staking -</label> &nbsp;&nbsp;
            <label className='stak_value'>{poolData[poolId].maxStake} RCKC</label>            
            </div>
          
          </div>
        </div>
        <div className='right_content_stak'>
          <div className='detail_box'>
            <h2>Details - {poolData[poolId].name} </h2>
            <p>{poolData[poolId].apy}% APY</p>
            <p>{poolData[poolId].maxPool} RCKC Max Pool Size</p>
            <p>{poolData[poolId].lock} Days Minimum Duration</p>
            <p>{poolData[poolId].maxStake} RCKC  Maximum Staking</p>
            <p>{poolData[poolId].fee}% Early-Withdrawal Fee</p>
          </div>
        </div>
      </div>
    </div>


    </div>
  );
}

export default App;
