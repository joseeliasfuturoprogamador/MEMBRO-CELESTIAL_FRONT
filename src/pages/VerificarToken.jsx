import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VerificarToken = () => {
  const [token, setToken] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const handleVerify = async () => {
    try {
      const nome = localStorage.getItem("igrejaNome");

      const response = await axios.post("http://localhost:3000/api/igreja/verificar-token", {
        nome,
        token,
      });

      localStorage.setItem("tokenVerificado", "true");

      toast({
        title: "Token verificado com sucesso!",
        description: "Você será redirecionado para o dashboard.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      toast({
        title: "Token inválido",
        description: error.response?.data?.message || "Tente novamente.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePasteToken = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setToken(clipboardText);
      toast({
        title: "Token colado!",
        description: "O token foi colado com sucesso.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Erro ao colar token:", error);
      toast({
        title: "Erro ao colar token",
        description: "Não foi possível acessar a área de transferência.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex h="100vh" align="center" justify="center" bg="gray.100">
      <Box bg="white" p={10} borderRadius="md" boxShadow="lg" w="90%" maxW="400px">
        <Text fontSize="2xl" mb={6} fontWeight="bold" color="purple.700" textAlign="center">
          Verificar Token
        </Text>

        <Alert status="info" borderRadius="md" mb={4}>
          <AlertIcon />
          <Box>
            <AlertTitle>Token enviado!</AlertTitle>
            <AlertDescription>Verifique sua caixa de entrada do e-mail ou Spam.</AlertDescription>
          </Box>
        </Alert>

        <VStack spacing={4}>
          <Input
            placeholder="Cole o token recebido por e-mail"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />

          <Button colorScheme="blue" variant="outline" w="full" onClick={handlePasteToken}>
            Colar Token
          </Button>

          <Button colorScheme="purple" w="full" onClick={handleVerify}>
            Verificar
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default VerificarToken;
