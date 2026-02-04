import { useState, useEffect } from "react";
import {
  Flex,
  Box,
  Input,
  Button,
  Text,
  VStack,
  useToast,
  Heading,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const RedefinirSenha = () => {
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const email = sessionStorage.getItem("emailReset");

  useEffect(() => {
    if (!email) {
      navigate("/recuperar-senha");
    }
  }, [email, navigate]);

  const handleRedefinirSenha = async () => {
    if (!codigo.trim() || !novaSenha.trim()) {
      toast({
        title: "Campos incompletos",
        description: "Preencha o código e a nova senha.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/redefinir-senha`, {
        email,
        codigo,
        novaSenha,
      });

      toast({
        title: "Senha redefinida!",
        description: "Agora você pode fazer login com a nova senha.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      // Limpa email temporário
      sessionStorage.removeItem("emailReset");

      navigate("/cadastro-igreja");
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Código inválido ou expirado.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleColarCodigo = async () => {
    try {
      const texto = await navigator.clipboard.readText();
      setCodigo(texto);
      toast({
        title: "Código colado!",
        description: "Código do clipboard inserido automaticamente.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro",
        description: "Não foi possível acessar o clipboard.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex h="100vh" align="center" justify="center" bg="gray.100">
      <Box
        bg="white"
        p={10}
        borderRadius="md"
        boxShadow="2xl"
        w={{ base: "90%", md: "400px" }}
      >
        <Heading textAlign="center" mb={6} color="blue.600">
          Redefinir Senha
        </Heading>

        <VStack spacing={4}>
          <Text textAlign="center">
            Insira o código recebido e a nova senha para redefinir sua senha
          </Text>

          <Input
            placeholder="Código de Confirmação"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            textAlign="center"
            fontSize="lg"
          />

          <Button w="full" onClick={handleColarCodigo} variant="outline">
            Colar Código do Clipboard
          </Button>

          <Input
            placeholder="Nova Senha"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />

          <Button
            colorScheme="blue"
            w="full"
            onClick={handleRedefinirSenha}
            isLoading={loading}
          >
            Redefinir Senha
          </Button>

          <Button
            variant="link"
            colorScheme="blue"
            onClick={() => navigate("/cadastro-igreja")}
          >
            Voltar
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default RedefinirSenha;
