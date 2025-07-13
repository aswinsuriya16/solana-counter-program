import {test,expect} from 'bun:test'
import { LiteSVM } from "litesvm";
import {
	PublicKey,
	Transaction,
	SystemProgram,
	Keypair,
	LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { pathToFileURL } from 'bun';

test("Data account created", () => {
	const svm = new LiteSVM();
	const payer = Keypair.generate();
    const dataAccount = Keypair.generate();
    const contractPubkey = PublicKey.unique();
    //deploying to local svm 
    svm.addProgramFromFile(contractPubkey,"./binary/first_sol_contract.so")
	svm.airdrop(payer.publicKey, BigInt(LAMPORTS_PER_SOL));
	const blockhash = svm.latestBlockhash();
	const ixs = [
		SystemProgram.createAccount({
			fromPubkey: payer.publicKey,
			newAccountPubkey: dataAccount.publicKey,
			lamports: Number(svm.minimumBalanceForRentExemption(BigInt(4))),
            space : 4,
            programId : contractPubkey
		}),
	];
	const tx = new Transaction();
	tx.recentBlockhash = blockhash;
    tx.feePayer = payer.publicKey;
	tx.add(...ixs);
	tx.sign(payer,dataAccount);
	svm.sendTransaction(tx);
});