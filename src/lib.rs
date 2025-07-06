use borsh::{BorshSerialize,BorshDeserialize};
use solana_program::{
    account_info::{next_account_info,AccountInfo},
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
    entrypoint
};

#[derive(BorshDeserialize,BorshSerialize)]
enum InstructionType {
    Increment(u32),
    Decrement(u32)
}

#[derive(BorshSerialize,BorshDeserialize)]
struct Counter {
    count : u32
}

entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id : &Pubkey,
    accounts : &[AccountInfo],
    instruction_data : &[u8],
) -> ProgramResult {
    let account = next_account_info(&mut accounts.iter())?;
    let mut counter = Counter::try_from_slice(&account.data.borrow())?;
    let instruction_type = InstructionType::try_from_slice(instruction_data)?;

    match instruction_type {
        InstructionType::Increment(val) => {
            msg!("Incrementing");
            counter.count += val;
        }
        InstructionType::Decrement(val) => {
            msg!("Decrementing");
            counter.count -= val;
        }
    }

    counter.serialize(&mut *account.data.borrow_mut())?;
    msg!("Counter updated to {}",counter.count);
    Ok(())
}