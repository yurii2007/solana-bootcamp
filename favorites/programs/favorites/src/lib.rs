use anchor_lang::prelude::*;

declare_id!("5dTy4y7Vo2jmPevGvHbxXpWFNuyKoZ9cDRck2ex5vYm1");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod favorites {
    use super::*;

    pub fn set_favorites(
        context: Context<SetFavorites>,
        number: u64,
        color: String,
        hobbies: Vec<String>,
    ) -> Result<()> {
        msg!("Hello from set_favorites: {}", context.program_id);

        let user_pk = context.accounts.user.key();

        msg!("User public key: {}", user_pk);
        msg!("Favorite number: {}", number);
        msg!("Favorite color: {}", color);
        msg!("Favorite hobbies: {:?}", hobbies);

        context.accounts.favorites.set_inner(Favorites {
            number,
            color,
            hobbies,
        });

        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct Favorites {
    pub number: u64,

    #[max_len(50)]
    pub color: String,

    #[max_len(5; 50)]
    pub hobbies: Vec<String>,
}

#[derive(Accounts)]
pub struct SetFavorites<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init_if_needed,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + Favorites::INIT_SPACE,
        seeds = [b"favorites", user.key().as_ref()],
        bump
        )]
    pub favorites: Account<'info, Favorites>,

    pub system_program: Program<'info, System>,
}
