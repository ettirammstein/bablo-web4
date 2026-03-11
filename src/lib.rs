use near_sdk::{env, near_bindgen, AccountId};
use near_sdk::json_types::{U128, ValidAccountId};

#[near_bindgen]
pub struct Contract {
    balances: std::collections::HashMap<AccountId, u128>,
        total_supply: u128,
        }

        #[near_bindgen]
        impl Contract {
            #[init]
                pub fn new(total_supply: U128, owner_id: AccountId) -> Self {
                        let mut this = Self {
                                    balances: std::collections::HashMap::new(),
                                                total_supply: total_supply.0,
                                                        };
                                                                this.balances.insert(owner_id, total_supply.0);
                                                                        this
                                                                            }

                                                                                pub fn ft_balance_of(&self, account_id: AccountId) -> U128 {
                                                                                        U128(*self.balances.get(&account_id).unwrap_or(&0))
                                                                                            }

                                                                                                pub fn ft_total_supply(&self) -> U128 {
                                                                                                        U128(self.total_supply)
                                                                                                            }

                                                                                                                pub fn ft_transfer(&mut self, receiver_id: ValidAccountId, amount: U128) {
                                                                                                                        let sender_id = env::predecessor_account_id();
                                                                                                                                let amount = amount.0;
                                                                                                                                        let sender_balance = *self.balances.get(&sender_id).unwrap_or(&0);
                                                                                                                                                assert!(sender_balance >= amount, "Low balance");
                                                                                                                                                        let receiver_id: AccountId = receiver_id.into();
                                                                                                                                                                let receiver_balance = *self.balances.get(&receiver_id).unwrap_or(&0);
                                                                                                                                                                        self.balances.insert(sender_id.clone(), sender_balance - amount);
                                                                                                                                                                                self.balances.insert(receiver_id, receiver_balance + amount);
                                                                                                                                                                                    }
                                                                                                                                                                                    }