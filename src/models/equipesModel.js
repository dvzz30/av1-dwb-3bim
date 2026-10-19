import prisma from "../config/prisma.js";

export function criarEquipe({ nome, pais, cidade, estadio, titulos }) {
    return prisma.equipe.create({
        data: {
            nome,
            pais,
            cidade,
            estadio,
            titulos
        }
    });
}