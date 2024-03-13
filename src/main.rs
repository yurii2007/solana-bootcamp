use std::{env, process};

use rust_cli::{Config, run};

fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::build(&args).unwrap_or_else(|err| {
        println!("Problem with parsing arguments: {err}");
        process::exit(1);
    });

    if let Err(e) = run(config) {
        println!("application error: {e}");
        process::exit(1);
    };
}