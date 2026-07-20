#!/bin/bash
# Script para enviar o Compatix OS para o GitHub de forma simples

echo "=========================================================="
echo "      Configuração de Envio para o GitHub: app-cpx        "
echo "=========================================================="
echo ""
echo "Seu repositório local já está configurado e com os arquivos commitados na branch 'main'."
echo "Por favor, digite o seu nome de usuário do GitHub (ex: danielgomes):"
read -r username

if [ -z "$username" ]; then
  echo "Nome de usuário inválido. Operação cancelada."
  exit 1
fi

# Remove o remote 'origin' se ele já existir
git remote remove origin 2>/dev/null

# Adiciona o novo remote apontando para o seu repositório "app-cpx"
git remote add origin "https://github.com/$username/app-cpx.git"

echo ""
echo "Enviando os arquivos para: https://github.com/$username/app-cpx.git..."
echo "Pressione Enter para confirmar e iniciar o envio..."
read -r

git push -u origin main

echo ""
echo "=========================================================="
echo " Concluído! Se o terminal solicitar suas credenciais:"
echo " 1. Use o seu e-mail ou usuário do GitHub."
echo " 2. Use um Token de Acesso Pessoal (PAT) do GitHub como senha."
echo "=========================================================="
