import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  Flex,
  useToast,
} from "@chakra-ui/react";

const ConfirmarCodigo = () => {
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState(() => sessionStorage.getItem("igrejaEmail") || "");

  // Atualiza o email do sessionStorage ao mudar de aba ou janela
  useEffect(() => {
    const handleFocus = () => {
      setEmail(sessionStorage.getItem("igrejaEmail") || "");
    };

    const handleStorage = () => {
      setEmail(sessionStorage.getItem("igrejaEmail") || "");
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (!email) {
      toast({
        title: "Erro",
        description: "Dados da igreja não encontrados. Faça login novamente.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      navigate("/");
    }
  }, [email, navigate, toast]);

  const handleSubmit = async () => {
    setError("");

    if (!codigo.trim()) {
      setError("Informe o código enviado por e-mail");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/confirmar", {
        email,
        codigo,
      });

      const { idIgreja, message } = response.data;

      if (!idIgreja) {
        throw new Error("ID da igreja não retornado pelo servidor.");
      }

      // Remove o id antigo e salva o novo corretamente
      sessionStorage.removeItem("idIgreja");
      sessionStorage.setItem("idIgreja", idIgreja);
      sessionStorage.setItem("verified", "true");
      sessionStorage.setItem("needsVerification", "false");

      toast({
        title: message || "Código verificado com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/dashboard");
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Erro ao verificar código");
      console.error("Erro na verificação:", backendMessage || err.message);
    }
  };

  return (
    <Flex h="100vh" align="center" justify="center" bg="gray.100">
      <Box bg="white" p={8} rounded="md" shadow="md" w="400px">
        <Text
          fontSize="2xl"
          fontWeight="bold"
          mb={6}
          textAlign="center"
          color="blue.700"
        >
          Confirme o código enviado por e-mail
        </Text>

        <VStack spacing={4}>
          <Input
            placeholder="Código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            maxLength={6}
            autoFocus
          />

          {error && (
            <Text color="red.500" fontSize="sm" textAlign="center">
              {error}
            </Text>
          )}

          <Button colorScheme="blue" w="full" onClick={handleSubmit}>
            Confirmar
          </Button>

          <Button
            variant="link"
            color="gray.500"
            mt={2}
            onClick={() => navigate("/")}
          >
            Voltar para login
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default ConfirmarCodigo;
