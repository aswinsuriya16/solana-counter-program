import {expect , test} from "bun:test";
import {Connection,Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction} from '@solana/web3.js'
import { COUNTER_SIZE, schema } from "./types";
import * as borsh from 'borsh';

let adminAccount = Keypair.generate();
let dataAccount = Keypair.generate();

test("Account is initialized",async()=>{
    //Airdrop
    const connection = new Connection("http://127.0.0.1:8899"); // Local Chain
    const airdrop = await connection.requestAirdrop(adminAccount.publicKey,1*LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdrop);
    const data = await connection.getAccountInfo(adminAccount.publicKey);
    //create account 
    const lamports = await connection.getMinimumBalanceForRentExemption(COUNTER_SIZE); 
    const programid = new PublicKey("BfpAUSM6eEgFK9BLxj7iZfNB5RUyCbA47CvmcutmEPmv"); // Deployed program Id
    const txn = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey : adminAccount.publicKey,
            lamports,
            newAccountPubkey : dataAccount.publicKey,
            programId : programid,
            space : COUNTER_SIZE
        })
    );
    const signature = await connection.sendTransaction(txn,[adminAccount,dataAccount]);
    await connection.confirmTransaction(signature);
    //console.log(adminAccount.publicKey.toBase58());
    // console.log(dataAccount.publicKey.toBase58());

    const counterAccount = await connection.getAccountInfo(dataAccount.publicKey);
    if(!counterAccount) { 
        throw new Error("Account does not exist");
    }
    const counter = borsh.deserialize(schema,counterAccount.data)
})