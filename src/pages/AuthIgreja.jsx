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

// 🔧 URL do backend
const API_URL = import.meta.env.VITE_API_URL;

const CadastroLogin = () => {
  const [modoCadastro, setModoCadastro] = useState(true);
  const [formData, setFormData] = useState({ nome: "", email: "", senha: "" });
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!API_URL) throw new Error("API_URL não definida!");

      if (modoCadastro) {
        // CADASTRO
        const response = await axios.post(`${API_URL}/api/cadastrar`, formData);

        // Salva temporariamente email e idIgreja retornado pelo backend
        sessionStorage.setItem("igrejaEmail", formData.email);
        sessionStorage.setItem("idIgrejaTemp", response.data.idIgreja);

        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email e insira o código para confirmar.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Redireciona para tela de confirmação de código
        navigate("/confirmar-codigo");
      } else {
        // LOGIN
        const response = await axios.post(`${API_URL}/api/login`, {
          nome: formData.email, // Backend aceita nome ou email
          senha: formData.senha,
        });

        const { idIgreja } = response.data;

        if (!idIgreja) {
          toast({
            title: "Login não permitido",
            description: "Sua igreja ainda não foi confirmada.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        // Salva idIgreja definitivo no sessionStorage
        sessionStorage.setItem("idIgreja", idIgreja);

        toast({
          title: "Login realizado!",
          description: "Redirecionando para o dashboard...",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <Flex h="100vh" align="center" justify="center" bg="gray.100">
      <Flex
        w={{ base: "90%", md: "900px" }}
        bg="white"
        boxShadow="2xl"
        borderRadius="lg"
        overflow="hidden"
      >
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

        <Box w="60%" p={10}>
          <Text
            fontSize="3xl"
            fontWeight="bold"
            textAlign="center"
            color="blue.700"
          >
            {modoCadastro ? "Criar Conta da Igreja" : "Login da Igreja"}
          </Text>

          <VStack spacing={5} mt={6} as="form" onSubmit={handleSubmit}>
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
            <Input
              placeholder="Senha"
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
            <Button w="full" colorScheme="blue" type="submit">
              {modoCadastro ? "Registrar" : "Entrar"}
            </Button>
          </VStack>

          {!modoCadastro && (
            <Text mt={2} textAlign="center" color="blue.500">
              <Link onClick={() => navigate("/recuperar-senha")}>
                Esqueceu a senha?
              </Link>
            </Text>
          )}

          <Text
            mt={6}
            textAlign="center"
            color="gray.600"
            fontWeight="medium"
            cursor="pointer"
            onClick={() => setModoCadastro(!modoCadastro)}
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
