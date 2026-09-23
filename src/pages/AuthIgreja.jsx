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

    try {
      if (!API_URL) {
        throw new Error("API_URL não definida!");
      }

      // =========================
      // CADASTRO
      // =========================
      if (modoCadastro) {
        const response = await axios.post(
          `${API_URL}/api/cadastrar`,
          formData
        );

        // Salva temporariamente o email e o ID da igreja
        sessionStorage.setItem(
          "igrejaEmail",
          formData.email
        );

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
      }

      // =========================
      // LOGIN
      // =========================
      else {
        const response = await axios.post(
          `${API_URL}/api/login`,
          {
            nome: formData.email,
            senha: formData.senha,
          }
        );

        const { idIgreja } = response.data;

        // Verifica se a igreja foi confirmada
        if (!idIgreja) {
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

        // ==========================================
        // SALVA O ID DEFINITIVO DA IGREJA
        // ==========================================
        sessionStorage.setItem(
          "idIgreja",
          String(idIgreja)
        );

        // Remove possível ID temporário antigo
        sessionStorage.removeItem("idIgrejaTemp");

        console.log(
          "Login realizado. ID da igreja:",
          sessionStorage.getItem("idIgreja")
        );

        toast({
          title: "Login realizado!",
          description: "Entrando no dashboard...",
          status: "success",
          duration: 1500,
          isClosable: true,
        });

        // ==========================================
        // ENTRA NO DASHBOARD
        // ==========================================
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      }
    } catch (error) {
      console.error(
        "Erro no login/cadastro:",
        error.response?.data || error.message
      );

      toast({
        title: "Erro",
        description:
          error.response?.data?.message ||
          error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex
      h="100vh"
      align="center"
      justify="center"
      bg="gray.100"
    >
      <Flex
        w={{ base: "90%", md: "900px" }}
        bg="white"
        boxShadow="2xl"
        borderRadius="lg"
        overflow="hidden"
      >
        {/* LADO DA LOGO */}
        <Box
          w="40%"
          bg="blue.500"
          p={6}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Image
            src="./logo.jpg"
            alt="Logo Membro Celestial"
            maxH="250px"
            borderRadius="md"
            boxShadow="xl"
          />
        </Box>

        {/* FORMULÁRIO */}
        <Box w="60%" p={10}>
          <Text
            fontSize="3xl"
            fontWeight="bold"
            textAlign="center"
            color="blue.700"
          >
            {modoCadastro
              ? "Criar Conta da Igreja"
              : "Login da Igreja"}
          </Text>

          <VStack
            spacing={5}
            mt={6}
            as="form"
            onSubmit={handleSubmit}
          >
            {/* CAMPOS DO CADASTRO */}
            {modoCadastro && (
              <>
                <Input
                  placeholder="E-mail da Igreja"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />

                <Input
                  placeholder="Nome da Igreja"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  autoComplete="organization"
                />
              </>
            )}

            {/* CAMPO DE EMAIL NO LOGIN */}
            {!modoCadastro && (
              <Input
                placeholder="E-mail da Igreja"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            )}

            {/* SENHA */}
            <Input
              placeholder="Senha"
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />

            {/* BOTÃO */}
            <Button
              w="full"
              colorScheme="blue"
              type="submit"
            >
              {modoCadastro ? "Registrar" : "Entrar"}
            </Button>
          </VStack>

          {/* RECUPERAR SENHA */}
          {!modoCadastro && (
            <Text
              mt={2}
              textAlign="center"
              color="blue.500"
            >
              <Link
                onClick={() =>
                  navigate("/recuperar-senha")
                }
              >
                Esqueceu a senha?
              </Link>
            </Text>
          )}

          {/* ALTERAR ENTRE LOGIN E CADASTRO */}
          <Text
            mt={6}
            textAlign="center"
            color="gray.600"
            fontWeight="medium"
            cursor="pointer"
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