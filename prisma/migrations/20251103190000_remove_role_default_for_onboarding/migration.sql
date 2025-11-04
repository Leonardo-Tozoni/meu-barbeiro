-- RemoverDefaultRoleParaForcarOnboarding
-- Remove o default CLIENT da coluna role para que novos usuários
-- sejam criados sem role e passem pelo onboarding

ALTER TABLE "User" ALTER COLUMN "role" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
