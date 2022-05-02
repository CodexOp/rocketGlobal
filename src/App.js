import './App.css';
import bag from './images/bag.png'
function App() {
  return (
    <div className="rocketglobal">
      <div className='landing'>
        <h2>Rocket Global Staking</h2>
        <p>Get RCKC staking reward when you participate in our high yield staking system.</p>
        <div className='buttons'>
        <button>Connect Wallet</button>
        </div>
      </div>


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
            <input type='string'/>
            <div className='inputpart1'>
              <select>
                <option>Bronze</option>
                <option>Gold</option>
                <option>Diaomand</option>
              </select>
            </div>
            </div>
          </div>
          <div className='input_box'>
            <div>
            <label>Select Staking Type</label>
            </div>
            <div className='input2'>
            <input type='string'/>
            <div className='inputpart'>
              <p>RCKC</p>
            </div>
            </div>
          </div>
          <div className='input_box'>
            <div>
            <label>Enter Staking Duration (Days)</label>
            </div>
            <input type="number"></input>
          </div>
        </div>
        <div className='right_content_stak'>
          <div className='detail_box'>
            <h2>Details - BRONZE</h2>
            <p>25% APY</p>
            <p>7 Days Minimum Duration</p>
            <p>100 RCKC  Minimum Staking</p>
            <p>25% Early-Withdrawal Fee</p>
          </div>
        </div>
      </div>
    </div>


    </div>
  );
}

export default App;
