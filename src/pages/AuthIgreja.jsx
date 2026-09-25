import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  VStack,
  Image,
  useToast,
  Link,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// URL do backend
const API_URL = import.meta.env.VITE_API_URL;

const CadastroLogin = () => {
  const [modoCadastro, setModoCadastro] = useState(true);
  const [carregando, setCarregando] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (carregando) {
      return;
    }

    try {
      if (!API_URL) {
        throw new Error("API_URL não definida!");
      }

      setCarregando(true);

      // =========================
      // CADASTRO
      // =========================
      if (modoCadastro) {
        const response = await axios.post(
          `${API_URL}/api/cadastrar`,
          formData
        );

        // Salva temporariamente o email
        sessionStorage.setItem(
          "igrejaEmail",
          formData.email
        );

        // Salva o ID temporário da igreja
        sessionStorage.setItem(
          "idIgrejaTemp",
          String(response.data.idIgreja)
        );

        toast({
          title: "Cadastro realizado!",
          description:
            "Verifique seu email e insira o código para confirmar.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Vai para confirmação do código
        navigate("/confirmar-codigo");

        return;
      }

      // =========================
      // LOGIN
      // =========================
      const response = await axios.post(
        `${API_URL}/api/login`,
        {
          nome: formData.email,
          senha: formData.senha,
        }
      );

      const { idIgreja } = response.data;

      // =========================
      // VERIFICA ID DA IGREJA
      // =========================
      if (!idIgreja) {
        setCarregando(false);

        toast({
          title: "Login não permitido",
          description:
            "Sua igreja ainda não foi confirmada.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });

        return;
      }

      // =========================
      // SALVA ID DEFINITIVO
      // =========================
      sessionStorage.setItem(
        "idIgreja",
        String(idIgreja)
      );

      // Remove ID temporário antigo
      sessionStorage.removeItem("idIgrejaTemp");

      console.log(
        "Login realizado. ID da igreja:",
        sessionStorage.getItem("idIgreja")
      );

      // =========================
      // MENSAGEM DE LOGIN
      // =========================
      toast({
        title: "Login realizado!",
        description: "Entrando no dashboard...",
        status: "success",
        duration: 1200,
        isClosable: true,
      });

      // =========================
      // ENTRA NO DASHBOARD
      // =========================
      // Recarrega o aplicativo depois de salvar
      // o idIgreja no sessionStorage.
      //
      // Isso evita o problema do App.jsx ainda
      // estar com idIgreja vazio no momento do navigate.
      window.location.replace("/dashboard");
    } catch (error) {
      console.error(
        "Erro no login/cadastro:",
        error.response?.data || error.message
      );

      setCarregando(false);

      toast({
        title: "Erro",
        description:
          error.response?.data?.message ||
          error.message ||
          "Não foi possível realizar a operação.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex
      minH="100vh"
      w="100%"
      align="center"
      justify="center"
      bg="gray.100"
      px={{ base: 3, sm: 5, md: 8 }}
      py={{ base: 4, md: 8 }}
      overflowY="auto"
    >
      <Flex
        w="100%"
        maxW="900px"
        minH={{ base: "auto", md: "550px" }}
        bg="white"
        boxShadow="2xl"
        borderRadius={{ base: "md", md: "lg" }}
        overflow="hidden"
        direction={{ base: "column", md: "row" }}
      >
        {/* =========================
            LADO DA LOGO
        ========================= */}
        <Box
          w={{ base: "100%", md: "40%" }}
          minH={{
            base: "180px",
            sm: "210px",
            md: "550px",
          }}
          bg="blue.500"
          p={{ base: 4, sm: 6, md: 8 }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <Image
            src="./logo.jpg"
            alt="Logo Membro Celestial"
            maxW={{
              base: "160px",
              sm: "190px",
              md: "250px",
            }}
            maxH={{
              base: "150px",
              sm: "180px",
              md: "250px",
            }}
            w="auto"
            h="auto"
            objectFit="contain"
            borderRadius="md"
            boxShadow="xl"
          />
        </Box>

        {/* =========================
            FORMULÁRIO
        ========================= */}
        <Box
          w={{ base: "100%", md: "60%" }}
          p={{
            base: 5,
            sm: 7,
            md: 10,
          }}
        >
          <Text
            fontSize={{
              base: "2xl",
              sm: "2xl",
              md: "3xl",
            }}
            fontWeight="bold"
            textAlign="center"
            color="blue.700"
            lineHeight="1.2"
          >
            {modoCadastro
              ? "Criar Conta da Igreja"
              : "Login da Igreja"}
          </Text>

          <VStack
            spacing={{
              base: 4,
              md: 5,
            }}
            mt={{
              base: 5,
              md: 6,
            }}
            as="form"
            onSubmit={handleSubmit}
            w="100%"
          >
            {/* =========================
                CAMPOS DO CADASTRO
            ========================= */}
            {modoCadastro && (
              <>
                <Input
                  w="100%"
                  size="lg"
                  placeholder="E-mail da Igreja"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />

                <Input
                  w="100%"
                  size="lg"
                  placeholder="Nome da Igreja"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  autoComplete="organization"
                />
              </>
            )}

            {/* =========================
                EMAIL NO LOGIN
            ========================= */}
            {!modoCadastro && (
              <Input
                w="100%"
                size="lg"
                placeholder="E-mail da Igreja"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                type="email"
              />
            )}

            {/* =========================
                SENHA
            ========================= */}
            <Input
              w="100%"
              size="lg"
              placeholder="Senha"
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />

            {/* =========================
                BOTÃO
            ========================= */}
            <Button
              w="100%"
              minH="48px"
              colorScheme="blue"
              type="submit"
              isLoading={carregando}
              loadingText="Entrando..."
              fontSize="md"
            >
              {modoCadastro ? "Registrar" : "Entrar"}
            </Button>
          </VStack>

          {/* =========================
              RECUPERAR SENHA
          ========================= */}
          {!modoCadastro && (
            <Text
              mt={3}
              textAlign="center"
              color="blue.500"
              fontSize={{
                base: "sm",
                md: "md",
              }}
            >
              <Link
                onClick={() =>
                  navigate("/recuperar-senha")
                }
                cursor="pointer"
              >
                Esqueceu a senha?
              </Link>
            </Text>
          )}

          {/* =========================
              ALTERAR LOGIN/CADASTRO
          ========================= */}
          <Text
            mt={{
              base: 5,
              md: 6,
            }}
            textAlign="center"
            color="gray.600"
            fontWeight="medium"
            cursor="pointer"
            fontSize={{
              base: "sm",
              md: "md",
            }}
            px={2}
            onClick={() =>
              setModoCadastro(!modoCadastro)
            }
          >
            {modoCadastro
              ? "Já tem conta? Faça login!"
              : "Não tem conta? Cadastre-se!"}
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
};

export default CadastroLogin;