
import React from 'react';
import * as ethers from 'ethers';

const CONTRACT_ADDRESS = '0x66efDFc43AbdD960bea175dfB3C1198F6C807F40';
const CHAIN_ID = 17000;

const ABI = [
  "function stake(uint256 amount) external",
  "function withdraw(uint256 amount) public",
  "function claimRewards() public",
  "function getStakedBalance(address account) external view returns (uint256)",
  "function getTotalStaked() external view returns (uint256)",
  "function earned(address account) public view returns (uint256)"
];

const StakingInterface: React.FC = () => {
  const [provider, setProvider] = React.useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = React.useState<ethers.Signer | null>(null);
  const [contract, setContract] = React.useState<ethers.Contract | null>(null);
  const [userAddress, setUserAddress] = React.useState<string>('');
  const [stakedBalance, setStakedBalance] = React.useState<string>('0');
  const [totalStaked, setTotalStaked] = React.useState<string>('0');
  const [earnedRewards, setEarnedRewards] = React.useState<string>('0');
  const [stakeAmount, setStakeAmount] = React.useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  React.useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(web3Provider);
    }
  }, []);

  const connectWallet = async () => {
    if (provider) {
      try {
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        setSigner(signer);
        const address = await signer.getAddress();
        setUserAddress(address);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        setContract(contract);
        updateBalances(contract, address);
      } catch (err) {
        setError('Failed to connect wallet');
      }
    }
  };

  const switchChain = async () => {
    if (provider) {
      try {
        await provider.send('wallet_switchEthereumChain', [{ chainId: `0x${CHAIN_ID.toString(16)}` }]);
      } catch (err) {
        setError('Failed to switch network');
      }
    }
  };

  const updateBalances = async (contract: ethers.Contract, address: string) => {
    try {
      const stakedBalance = await contract.getStakedBalance(address);
      setStakedBalance(ethers.utils.formatEther(stakedBalance));
      const totalStaked = await contract.getTotalStaked();
      setTotalStaked(ethers.utils.formatEther(totalStaked));
      const earned = await contract.earned(address);
      setEarnedRewards(ethers.utils.formatEther(earned));
    } catch (err) {
      setError('Failed to update balances');
    }
  };

  const handleStake = async () => {
    if (contract && signer) {
      try {
        const network = await provider?.getNetwork();
        if (network?.chainId !== CHAIN_ID) {
          await switchChain();
        }
        const tx = await contract.stake(ethers.utils.parseEther(stakeAmount));
        await tx.wait();
        updateBalances(contract, await signer.getAddress());
        setStakeAmount('');
      } catch (err) {
        setError('Staking failed');
      }
    } else {
      await connectWallet();
    }
  };

  const handleWithdraw = async () => {
    if (contract && signer) {
      try {
        const network = await provider?.getNetwork();
        if (network?.chainId !== CHAIN_ID) {
          await switchChain();
        }
        const tx = await contract.withdraw(ethers.utils.parseEther(withdrawAmount));
        await tx.wait();
        updateBalances(contract, await signer.getAddress());
        setWithdrawAmount('');
      } catch (err) {
        setError('Withdrawal failed');
      }
    } else {
      await connectWallet();
    }
  };

  const handleClaimRewards = async () => {
    if (contract && signer) {
      try {
        const network = await provider?.getNetwork();
        if (network?.chainId !== CHAIN_ID) {
          await switchChain();
        }
        const tx = await contract.claimRewards();
        await tx.wait();
        updateBalances(contract, await signer.getAddress());
      } catch (err) {
        setError('Claiming rewards failed');
      }
    } else {
      await connectWallet();
    }
  };

  return (
    <div className="bg-gray-800 text-white p-8 w-full min-h-screen">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Staking Interface</h1>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="bg-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Staking Info</h2>
          <p>Address: {userAddress || 'Not connected'}</p>
          <p>Staked Balance: {stakedBalance} tokens</p>
          <p>Earned Rewards: {earnedRewards} tokens</p>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Stake Tokens</h2>
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="Amount to stake"
            className="bg-gray-600 text-white p-2 rounded mb-2 w-full"
          />
          <button onClick={handleStake} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Stake
          </button>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Withdraw Tokens</h2>
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Amount to withdraw"
            className="bg-gray-600 text-white p-2 rounded mb-2 w-full"
          />
          <button onClick={handleWithdraw} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
            Withdraw
          </button>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Claim Rewards</h2>
          <button onClick={handleClaimRewards} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">
            Claim Rewards
          </button>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Total Staked</h2>
          <p>{totalStaked} tokens</p>
        </div>
      </div>
    </div>
  );
};

export { StakingInterface as component };
