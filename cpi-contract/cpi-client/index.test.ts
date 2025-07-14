import { Connection, Keypair, PublicKey, Transaction, SystemProgram, TransactionInstruction,LAMPORTS_PER_SOL } from "@solana/web3.js";
import {test} from 'bun:test';

const connection = new Connection('https://api.devnet.solana.com');

test("Proxy CPI", async () => {
    const payer = Keypair.generate();
    await connection.requestAirdrop(payer.publicKey, LAMPORTS_PER_SOL);
    const counterProgramId = new PublicKey("As133FMPHi5ivKmnehxUKRcKHoXLb2btH6PisnqmC6T");
    const dataAccount = Keypair.generate();
    const createIx = SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: dataAccount.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(8),
        space: 8,
        programId: counterProgramId,
    });

    const tx = new Transaction().add(createIx);
    await connection.sendTransaction(tx, [payer, dataAccount]);
    const proxyIx = new TransactionInstruction({
        keys: [
            { pubkey: dataAccount.publicKey, isWritable: true, isSigner: false },
            { pubkey: counterProgramId, isWritable: false, isSigner: false },
        ],
        programId: new PublicKey(""),// didn't deployed yet
        data: Buffer.from(""), 
    });

    const transaction = new Transaction().add(proxyIx);
    await connection.sendTransaction(transaction,[payer]);
});