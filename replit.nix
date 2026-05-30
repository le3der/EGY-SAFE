# Nix environment for the EgySafe Replit workspace.
# Pins Node.js 20 (matches the .replit module) plus the package manager.
{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
  ];
}
