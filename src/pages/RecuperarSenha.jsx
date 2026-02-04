import { useState } from "react";
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

const RecuperarSenha = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSolicitarCodigo = async () => {
    if (!email.trim()) {
      toast({
        title: "Campo vazio",
        description: "Por favor, insira seu e-mail.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/solicitar-reset`, { email });

      toast({
        title: "Código enviado!",
        description: "Verifique seu e-mail e insira o código na próxima tela.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      // Salva e-mail temporário para a próxima tela
      sessionStorage.setItem("emailReset", email);

      navigate("/redefinir-senha");
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Não foi possível enviar o código.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
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
          Recuperar Senha
        </Heading>

        <VStack spacing={4}>
          <Text textAlign="center">
            Insira o e-mail da igreja para receber o código de redefinição
          </Text>

          <Input
            placeholder="E-mail da Igreja"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
          />

          <Button
            colorScheme="blue"
            w="full"
            onClick={handleSolicitarCodigo}
            isLoading={loading}
          >
            Enviar Código
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

export default RecuperarSenha;
