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
import { useNavigate } from "react-router-dom";
import axios from "axios";

// 🔧 URL do backend
const API_URL = import.meta.env.VITE_API_URL;

const ConfirmarCodigo = () => {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const email = sessionStorage.getItem("igrejaEmail");
  const idIgrejaTemp = sessionStorage.getItem("idIgrejaTemp");

  useEffect(() => {
    if (!email || !idIgrejaTemp) navigate("/cadastro-igreja");
  }, [email, idIgrejaTemp, navigate]);

  const handleConfirmar = async () => {
    if (!codigo.trim()) {
      toast({
        title: "Campo vazio",
        description: "Por favor, insira o código recebido por e-mail.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/confirmar`, { email, codigo });
      sessionStorage.setItem("idIgreja", response.data.idIgreja);
      sessionStorage.removeItem("idIgrejaTemp");
      sessionStorage.removeItem("igrejaEmail");

      toast({
        title: "Cadastro confirmado!",
        description: "Você já pode acessar o sistema.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Erro ao confirmar",
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
        title: "Código colado",
        description: `Código copiado: ${texto}`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch {
      toast({
        title: "Falha ao colar",
        description: "Não foi possível acessar a área de transferência.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex h="100vh" align="center" justify="center" bg="gray.100">
      <Box bg="white" p={10} borderRadius="md" boxShadow="2xl" w={{ base: "90%", md: "400px" }}>
        <Heading textAlign="center" mb={6} color="blue.600">
          Confirme seu Cadastro
        </Heading>

        <VStack spacing={4}>
          <Text textAlign="center">
            Insira o código enviado para <strong>{email}</strong>
          </Text>

          <Input
            placeholder="Código de Confirmação"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            maxLength={6}
            textAlign="center"
            fontSize="xl"
          />

          <Button colorScheme="blue" w="full" onClick={handleConfirmar} isLoading={loading}>
            Confirmar Código
          </Button>

          <Button colorScheme="teal" w="full" onClick={handleColarCodigo}>
            Colar Código
          </Button>

          <Button
            variant="link"
            colorScheme="blue"
            onClick={() => {
              sessionStorage.removeItem("idIgrejaTemp");
              sessionStorage.removeItem("igrejaEmail");
              navigate("/cadastro-igreja");
            }}
          >
            Voltar para Cadastro
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default ConfirmarCodigo;
