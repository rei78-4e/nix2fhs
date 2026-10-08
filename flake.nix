{
  description = "Cloudflare Workers (JS) dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        packages.default = pkgs.writeShellApplication {
          name = "nix2fhs";
          runtimeInputs = [ pkgs.nodejs_22 ];
          # bin/nix2fhs.js が ../src/fhs.js を import するため、必要なファイルだけまとめてストアに置く
          text =
            let
              src = pkgs.lib.fileset.toSource {
                root = ./.;
                fileset = pkgs.lib.fileset.unions [
                  ./package.json
                  ./bin
                  ./src/fhs.js
                ];
              };
            in
            ''exec node ${src}/bin/nix2fhs.js "$@"'';
        };

        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22
            wrangler

            biome
            taplo
          ];
        };
      }
    );
}
