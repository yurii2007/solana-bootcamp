use std::{env, fs};

fn main() {
    let args: Vec<String> = env::args().collect();
    
    let query = &args[1];
    let filename = &args[2];

    let content = fs::read_to_string(filename).expect("Should be able to reed the file");

    println!("{content}");
}
