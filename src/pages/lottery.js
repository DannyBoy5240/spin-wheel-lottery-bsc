import React, { useEffect, useState } from 'react'
import { useRef } from 'react'
import {ethers} from 'ethers'

import { Grid } from '@mui/material';
import { Box } from '@mui/system';
import { Button, Autocomplete, TextField, Typography, ButtonBase, styled, Snackbar, 
    CircularProgress, Alert } from '@mui/material';

import AttractionsIcon from '@mui/icons-material/Attractions';

import useSound from 'use-sound';

import Img_Wheel from './../assets/img/wheel.png'
import Img_Marker from './../assets/img/marker.png'
import Img_Spin from './../assets/img/spin.png'
import Img_Connect from './../assets/img/connect.png'

import spinAudio from './../assets/audio/spinAudio.mp3'
import winAudio from './../assets/audio/winAudio.mp3'

import './../assets/css/style.css'

import lotteryContractAbi from './../contracts/lotteryContract.json'
const contractAddress = '0x9AD7e154B8aDd086594eB6aF1C515172F65FfF4f'

import { Web3ReactProvider } from "@web3-react/core";

function getLibrary(provider, connector) {
    return new Web3(provider);
}   

const ImageButton = styled(ButtonBase)(({ theme }) => ({
    position: 'relative',
    height: 200,
    [theme.breakpoints.down('sm')]: {
      width: '100% !important', // Overrides inline-style
      height: 100,
    },
    '&:hover, &.Mui-focusVisible': {
      zIndex: 1,
      '& .MuiImageBackdrop-root': {
        opacity: 0.15,
      },
      '& .MuiImageMarked-root': {
        opacity: 0,
      },
      '& .MuiTypography-root': {
        border: '4px solid currentColor',
      },
    },
}));

const ImageSrc = styled('span')({
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center 40%',
});
  
const Image = styled('span')(({ theme }) => ({
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.common.white,
}));
  
const ImageMarked = styled('span')(({ theme }) => ({
    height: 3,
    width: 18,
    backgroundColor: theme.palette.common.white,
    position: 'absolute',
    bottom: -2,
    left: 'calc(50% - 9px)',
    transition: theme.transitions.create('opacity'),
}));

const Lottery = () => {

    const spinCounts = ['1', '2', '3', '5', '10', '15'];
    const wheelElement = useRef(null);
    const buySpin = useRef(null);
    const [currentAccount, setCurrentAccount] = useState(null);
    const [curSpinCount, setCurSpinCount] = useState(1);
    const [spinCount, setSpinCount] = useState(0);
    const [open, setOpen] = useState(0);
    const [buySpinLoading, setBuySpinLoading] = useState(false);
    // audio state
    const [play_spin_audio] = useSound(spinAudio);
    const [play_win_audio] = useSound(winAudio);

    const checkWalletIsConnected = async () => {
        const { ethereum } = window;
    
        if (!ethereum) {
          console.log("Wallet not connected!");
          return;
        } else {
            // Check wallet and get accounts
            const accounts = await ethereum.request({ method: "eth_accounts" });
            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log("Found an authorized account: ", account);
                setCurrentAccount(account);
                // Get Account Spin Counts
                getAccountSpinCounts(account);
            } else {
              console.log("No authorized account found.");
              setCurrentAccount(null);
            }
        }
    }
    useEffect(() => {
        checkWalletIsConnected();
    }, []);

    const getAccountSpinCounts = async (account) => {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const lotteryContract = new ethers.Contract(contractAddress,lotteryContractAbi, signer);
        const value = parseInt(await lotteryContract.getspincount(account));
        setSpinCount(value);
    }

    const connectWalletHandler = async() => {
        const { ethereum } = window;
        if (!ethereum) {
            alert("Please install Metamask!");
        }
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            console.log("Found an account! Address:", accounts[0]);
            setCurrentAccount(accounts[0]);    
        } catch (err) {
            console.log(err);
        }
    }

    const buySpinHandler = async () => {
        setBuySpinLoading(true);
        console.log('Waiting on  transaction success...');
        const { ethereum } = window;
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const lotteryContract = new ethers.Contract(contractAddress,lotteryContractAbi, signer)
            console.log(curSpinCount);
            await lotteryContract.deposit(curSpinCount,{value:25*(10**10)*curSpinCount}).then(txn => txn.wait(1));
            // After confirming transaction
            setBuySpinLoading(false);
            console.log('Successfully buy spins!');
            getAccountSpinCounts(currentAccount);
        }  else {
            setBuySpinLoading(false);
            alert('Wallet not connected!');
        }      
    }

    const startSpinWheel = async () => {
        console.log('Start SpinWheel!');
        // get random spin value from smart contract
        const { ethereum } = window;
        if (ethereum) {
            // play the game
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const lotteryContract = new ethers.Contract(contractAddress,lotteryContractAbi, signer)
            await lotteryContract.play();
            // run the wheel
            wheelElement.current.style.transition = 'all 5s ease';
            wheelElement.current.style.transform = `rotate(${3600}deg)`;
         // wheelElement.current.classList.add('blur');
            // get player game result
            let value = await lotteryContract.getresult(currentAccount); 
            value = parseInt(value);
            var deg = Math.floor(1800 + (Math.random()*45+(value-1)*45)-22.5);
            wheelElement.current.style.transform = `rotate(${deg}deg)`;

            // Notification
            setTimeout(() => {
                console.log(value);
                // notification
                setOpen(value);
                // play win spin audio effect
                play_win_audio();
            }, 5000);

            // play spin wheel effect
            play_spin_audio();
        }  else {
            alert('Wallet not connected!');
        }
    }

    // Snack Bar - Notification
    const alert_note = [
        'Oops!!! There is a problem with wallet connection! Try again!', 
        'Great! You don\'t need to pay tax for 30 minutes!',
        'Congratulations! You got 0.5 BNB for the prize!', 
        'Congratulations! You got 1 BNB for the prize!',
        'Lucky! You can try 3 free spins more!',
        'Great! Your tax is cut down in half for an hour!',
        'Congratulations! You got 1000 tokens for the prize!',
        'Great! You don\'t need to pay tax!', 
        'Great! You can re-spin the wheel for free!', 
    ];
    const handleNotificationClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(0);
    }

    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            <Box>
                <Grid container>
                    <Grid item xs={8} mt={5}>
                            <img src={Img_Marker} align="center" width="30px" height="50px" />
                        <Box>
                            <img className="wheel" draggable="false" src={Img_Wheel} ref={wheelElement} />
                        </Box>
                        <h1 id="result" className="result" />
                        <Box className="selection">
                            <h2 id="demo" />
                        </Box>
                    </Grid>
                    <Grid item xs={4} mt={5} align="right">
                        <Box>
                            {
                                currentAccount === null ?
                                    <Box sx={{ flexWrap: 'wrap', minWidth: 200, width: '100%' }}>
                                        <ImageButton
                                            focusRipple
                                            key={"Connect Wallet"}
                                            style={{
                                                width: 200,
                                                height: 70
                                            }}
                                            onClick={connectWalletHandler}
                                        >
                                            <ImageSrc style={{ backgroundImage: `url(${Img_Connect})` }} />
                                            <Image>
                                            <Typography
                                                component="span"
                                                variant="subtitle1"
                                                color="white"
                                                fontWeight="15px"
                                                fontSize="20px"
                                                sx={{
                                                position: 'relative',
                                                p: 4,
                                                pt: 2,
                                                pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,
                                                }}
                                            >
                                                Connect To Your Wallet
                                                <ImageMarked className="MuiImageMarked-root" />
                                            </Typography>
                                            </Image>
                                        </ImageButton>
                                    </Box>
                                : 
                                    <Box align="center" mt={6}>
                                        <Typography fontSize={24} fontWeight={8} color={'blue'}>Already connected with Wallet</Typography>
                                        <Typography fontSize={20} color={'white'} mt={1}>Your wallet address : </Typography>
                                        <Typography fontSize={18} color={'white'}>{currentAccount}</Typography>
                                    </Box>
                            }
                        </Box>
                        {
                            currentAccount !== null ?
                                <Grid container mt={5} ref={buySpin}>
                                    <Grid item xs={7} align="center">
                                        <Button
                                        style={{textTransform: 'none'}}
                                        size='large'
                                        variant="contained"
                                        disabled={buySpinLoading}
                                        startIcon={<AttractionsIcon />}
                                        sx={{
                                            '&.MuiButton-root': {
                                                color: 'white'
                                            },
                                            maxWidth: '200px', maxHeight: '55px', minWidth: '200px', minHeight: '55px'
                                        }}
                                        onClick={buySpinHandler}
                                        >Buy Spin
                                        {
                                            buySpinLoading !== false ?
                                                <CircularProgress color="inherit" size="1.5rem" />
                                            : null
                                        }</Button></Grid>

                                    <Grid item xs={5} align="center">
                                        <Autocomplete
                                        disablePortal
                                        id="combo-spin-count"
                                        options={spinCounts}
                                        sx={{ width: 150 }}
                                        defaultValue={'1'}
                                        onChange={(event) => {
                                            setCurSpinCount(+event.target.innerHTML);
                                        }}
                                    renderInput={(params) => <TextField {...params} label="Spin Counts to Buy" />}
                                        /></Grid>

                                    <Grid align="center" mt={3}>
                                        <Typography fontSize={20} color={'white'}>Remained spins: {spinCount}</Typography>            
                                        <Box pl={10} mt={5}>
                                        {
                                            spinCount > 0 ?
                                                <img className="button" draggable="false" src={Img_Spin} onClick={startSpinWheel} />
                                            : null
                                        }
                                        </Box>
                                    </Grid>
                                </Grid>
                            : null
                        }
                    </Grid>
                </Grid>

                <Snackbar
                    anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
                    open={open?true:false}
                    autoHideDuration={6000}
                    onClose={handleNotificationClose}>
                        <Alert onClose={handleNotificationClose} severity="info" sx={{ width: '100%' }}>
                            {alert_note[open]}
                        </Alert>
                </Snackbar>
            </Box>
        </Web3ReactProvider>
    )
}
export default Lottery;