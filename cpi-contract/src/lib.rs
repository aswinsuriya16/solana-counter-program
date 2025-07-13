use solana_program::{
    account_info::{next_account_info, AccountInfo}, 
    entrypoint::{ProgramResult}, 
    instruction::{AccountMeta, Instruction}, 
    program::invoke, 
    pubkey::Pubkey,
};
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    let mut iter = accounts.iter();
    let data_account = next_account_info(&mut iter)?;
    let counter_contract = next_account_info(&mut iter)?;
    
    let instruction = Instruction {
        program_id: *counter_contract.key,
        accounts: vec![AccountMeta {
            is_signer: false,
            is_writable: true,
            pubkey: *data_account.key
        }],
        data: instruction_data.to_vec()
    };
    
    invoke(&instruction, &[data_account.clone()])?;
    Ok(())
}