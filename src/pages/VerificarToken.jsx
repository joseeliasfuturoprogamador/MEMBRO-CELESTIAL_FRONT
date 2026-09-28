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

const API_URL = import.meta.env.VITE_API_URL;

const ConfirmarCodigo = () => {
  const [codigo, setCodigo] = useState("");
  const [email, setEmail] = useState("");
  const [idIgrejaTemp, setIdIgrejaTemp] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  // =====================================================
  // RECUPERA OS DADOS DO CADASTRO
  // =====================================================

  useEffect(() => {
    const emailSalvo =
      sessionStorage.getItem("igrejaEmail") || "";

    const idTemporario =
      sessionStorage.getItem("idIgrejaTemp") || "";

    console.log(
      "Tela de confirmação carregada"
    );

    console.log(
      "Email:",
      emailSalvo
    );

    console.log(
      "ID temporário:",
      idTemporario
    );

    if (!emailSalvo || !idTemporario) {
      toast({
        title: "Dados do cadastro não encontrados",
        description:
          "Faça o cadastro da igreja novamente.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });

      navigate("/cadastro-igreja", {
        replace: true,
      });

      return;
    }

    setEmail(emailSalvo);
    setIdIgrejaTemp(idTemporario);
  }, [navigate, toast]);

  // =====================================================
  // CONFIRMAR CÓDIGO
  // =====================================================

  const handleConfirmar = async () => {
    if (loading) {
      return;
    }

    if (!codigo.trim()) {
      toast({
        title: "Campo vazio",
        description:
          "Por favor, insira o código recebido por e-mail.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });

      return;
    }

    if (!email) {
      toast({
        title: "Email não encontrado",
        description:
          "Volte ao cadastro e tente novamente.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });

      return;
    }

    if (!API_URL) {
      toast({
        title: "Erro de configuração",
        description:
          "URL do servidor não configurada.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });

      return;
    }

    try {
      setLoading(true);

      console.log(
        "Confirmando código para:",
        email
      );

      const response = await axios.post(
        `${API_URL}/api/confirmar`,
        {
          email: email.trim(),
          codigo: codigo.trim(),
        }
      );

      console.log(
        "Resposta da confirmação:",
        response.data
      );

      if (!response.data?.idIgreja) {
        throw new Error(
          "O servidor não retornou o ID da igreja após a confirmação."
        );
      }

      // =====================================================
      // IGREJA CONFIRMADA
      // =====================================================

      sessionStorage.setItem(
        "idIgreja",
        String(response.data.idIgreja)
      );

      sessionStorage.removeItem(
        "idIgrejaTemp"
      );

      sessionStorage.removeItem(
        "igrejaEmail"
      );

      toast({
        title: "Cadastro confirmado!",
        description:
          "Sua igreja foi confirmada. Entrando no sistema...",
        status: "success",
        duration: 1800,
        isClosable: true,
      });

      setLoading(false);

      // =====================================================
      // VAI PARA O DASHBOARD
      // =====================================================

      window.dispatchEvent(
        new Event("igrejaLogada")
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Erro ao confirmar código:",
        error.response?.data ||
          error.message
      );

      setLoading(false);

      toast({
        title: "Erro ao confirmar",
        description:
          error.response?.data?.message ||
          error.message ||
          "Código inválido ou expirado.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // =====================================================
  // COLAR CÓDIGO
  // =====================================================

  const handleColarCodigo = async () => {
    try {
      const texto =
        await navigator.clipboard.readText();

      const codigoColado =
        texto.trim().slice(0, 6);

      setCodigo(codigoColado);

      toast({
        title: "Código colado",
        description:
          `Código: ${codigoColado}`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch {
      toast({
        title: "Falha ao colar",
        description:
          "Não foi possível acessar a área de transferência. Cole o código manualmente.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // =====================================================
  // VOLTAR
  // =====================================================

  const voltarCadastro = () => {
    sessionStorage.removeItem(
      "idIgrejaTemp"
    );

    sessionStorage.removeItem(
      "igrejaEmail"
    );

    navigate("/cadastro-igreja", {
      replace: true,
    });
  };

  return (
    <Flex
      minH="100vh"
      w="100%"
      align="center"
      justify="center"
      bg="gray.100"
      px={{ base: 3, sm: 5 }}
      py={6}
    >
      <Box
        bg="white"
        p={{
          base: 5,
          sm: 7,
          md: 10,
        }}
        borderRadius={{
          base: "lg",
          md: "md",
        }}
        boxShadow="2xl"
        w="100%"
        maxW="420px"
      >
        <Heading
          textAlign="center"
          mb={6}
          color="blue.600"
          fontSize={{
            base: "2xl",
            md: "3xl",
          }}
        >
          Confirme seu Cadastro
        </Heading>

        <VStack spacing={5}>
          <Text
            textAlign="center"
            fontSize={{
              base: "sm",
              md: "md",
            }}
            color="gray.600"
            wordBreak="break-word"
          >
            Insira o código enviado para{" "}
            <strong>{email}</strong>
          </Text>

          <Input
            placeholder="Código de Confirmação"
            value={codigo}
            onChange={(e) =>
              setCodigo(
                e.target.value
                  .replace(/\s/g, "")
                  .slice(0, 6)
              )
            }
            maxLength={6}
            textAlign="center"
            fontSize="xl"
            h="52px"
            inputMode="numeric"
            autoComplete="one-time-code"
          />

          <Button
            colorScheme="blue"
            w="full"
            minH="48px"
            onClick={handleConfirmar}
            isLoading={loading}
            loadingText="Confirmando..."
          >
            Confirmar Código
          </Button>

          <Button
            colorScheme="teal"
            w="full"
            minH="48px"
            onClick={handleColarCodigo}
            isDisabled={loading}
          >
            Colar Código
          </Button>

          <Button
            variant="link"
            colorScheme="blue"
            onClick={voltarCadastro}
            isDisabled={loading}
          >
            Voltar para Cadastro
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default ConfirmarCodigo;