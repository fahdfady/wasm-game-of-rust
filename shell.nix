# shell.nix
{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    # Rust toolchain
    rustc
    cargo
    rustfmt
    rust-analyzer
    
    # Required for wasm-pack
    wasm-pack
    
    # LLVM tools including lld linker
    llvmPackages.lld
    
    # Node.js and npm for the web part
    nodejs
    nodePackages.npm
    
    # Additional build tools
    pkg-config
    
    # If you need SSL/TLS support
    openssl
  ];

  # Set up environment variables if needed
  shellHook = ''
    export RUSTFLAGS="-C link-arg=-fuse-ld=lld"
  '';
}