import {expect , test} from "bun:test";
import {Connection,Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction} from '@solana/web3.js'
import { COUNTER_SIZE, schema , CounterAccount} from "./types";
import * as borsh from 'borsh';

let adminAccount = Keypair.generate();
let dataAccount = Keypair.generate();
const programid = new PublicKey("As133FMPHi5ivKmnehxUKRcKHoXLb2btH6PisnqmC6T"); // Deployed program Id

test("Account is initialized",async()=>{
    //Airdrop
    const connection = new Connection("https://api.devnet.solana.com");
    const airdrop = await connection.requestAirdrop(adminAccount.publicKey,1*LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdrop);
    const data = await connection.getAccountInfo(adminAccount.publicKey);
    //create account 
    const lamports = await connection.getMinimumBalanceForRentExemption(COUNTER_SIZE); 
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
    
    console.log(adminAccount.publicKey.toBase58());
    console.log(dataAccount.publicKey.toBase58());

    const counterAccount = await connection.getAccountInfo(dataAccount.publicKey);
    if(!counterAccount) { 
        throw new Error("Account does not exist");
    }
    const counter = borsh.deserialize(schema,counterAccount.data) as CounterAccount;
    console.log(counter);
})

test("Increment",async()=>{
    // we need to add the data to the blockchain
    const connection = new Connection("https://api.devnet.solana.com");
    const incrementvalue = 5;
    const txn = new Transaction().add({
        keys : [
            {
                pubkey : dataAccount.publicKey,
                isSigner : false,
                isWritable : true
            }
        ],
        programId : programid,
        data : Buffer.from(new Uint8Array([0,5,0,0,0]))
    });
    const sig = await connection.sendTransaction(txn,[adminAccount]);
    await connection.confirmTransaction(sig);
    console.log(sig);
    const counterAccount = await connection.getAccountInfo(dataAccount.publicKey);
    if(!counterAccount) {
        throw new Error("");
    }
    const counter = borsh.deserialize(schema,counterAccount.data) as CounterAccount;
    console.log(counter);
    console.log(counter.count);
});

test("Decrement",async()=>{
    const connection = new Connection("https://api.devnet.solana.com");
    const txn = new Transaction().add({
        keys : [
            {
                pubkey : dataAccount.publicKey,
                isSigner : false,
                isWritable : true
            }
        ],
        programId : programid,
        data : Buffer.from(new Uint8Array([1,3,0,0,0]))
    });
    const sig = await connection.sendTransaction(txn,[adminAccount]);
    await connection.confirmTransaction(sig);
    const counterAccount = await connection.getAccountInfo(dataAccount.publicKey);
    if(!counterAccount) {
        throw new Error("...")
    }
    const counter = borsh.deserialize(schema,counterAccount.data) as CounterAccount;
    console.log(counter);
    console.log(counter.count);
});
