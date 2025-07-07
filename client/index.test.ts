import {expect , test} from "bun:test";
import {Connection,Keypair, LAMPORTS_PER_SOL} from '@solana/web3.js'

let adminAccount = Keypair.generate();
let dataAccount = Keypair.generate();

test("Account is initialized",async()=>{
    const connection = new Connection("http://127.0.0.1:8899");
    const airdrop = await connection.requestAirdrop(adminAccount.publicKey,1*LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdrop);
    const data = await connection.getAccountInfo(adminAccount.publicKey);
    console.log(data);

})