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

    if (!API_URL) {
      toast({
        title: "Erro de configuração",
        description: "URL da API não configurada.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });

      return;
    }

    try {
      setCarregando(true);

      // =====================================================
      // CADASTRO DA IGREJA
      // =====================================================

      if (modoCadastro) {
        const response = await axios.post(
          `${API_URL}/api/cadastrar`,
          {
            nome: formData.nome.trim(),
            email: formData.email.trim(),
            senha: formData.senha,
          }
        );

        console.log(
          "Resposta do cadastro:",
          response.data
        );

        // Verifica se o backend realmente devolveu o ID
        if (!response.data?.idIgreja) {
          throw new Error(
            "A igreja foi cadastrada, mas o servidor não retornou o ID da igreja."
          );
        }

        // =====================================================
        // SALVA OS DADOS NECESSÁRIOS PARA A CONFIRMAÇÃO
        // =====================================================

        sessionStorage.setItem(
          "igrejaEmail",
          formData.email.trim()
        );

        sessionStorage.setItem(
          "idIgrejaTemp",
          String(response.data.idIgreja)
        );

        console.log(
          "Email temporário:",
          sessionStorage.getItem("igrejaEmail")
        );

        console.log(
          "ID temporário:",
          sessionStorage.getItem("idIgrejaTemp")
        );

        toast({
          title: "Cadastro realizado!",
          description:
            "Verifique seu email e insira o código de confirmação.",
          status: "success",
          duration: 2000,
          isClosable: true,
        });

        // IMPORTANTE:
        // tira o loading ANTES de mudar de tela
        setCarregando(false);

        // Vai para a tela de confirmação
        navigate("/confirmar-codigo", {
          replace: true,
        });

        return;
      }

      // =====================================================
      // LOGIN
      // =====================================================

      const response = await axios.post(
        `${API_URL}/api/login`,
        {
          nome: formData.email.trim(),
          senha: formData.senha,
        }
      );

      const { idIgreja } = response.data;

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

      // =====================================================
      // SALVA ID DEFINITIVO
      // =====================================================

      sessionStorage.setItem(
        "idIgreja",
        String(idIgreja)
      );

      sessionStorage.removeItem("idIgrejaTemp");
      sessionStorage.removeItem("igrejaEmail");

      console.log(
        "Login realizado. ID da igreja:",
        sessionStorage.getItem("idIgreja")
      );

      toast({
        title: "Login realizado!",
        description: "Entrando no dashboard...",
        status: "success",
        duration: 1200,
        isClosable: true,
      });

      // Avisa o App
      window.dispatchEvent(
        new Event("igrejaLogada")
      );

      setCarregando(false);

      navigate("/dashboard", {
        replace: true,
      });
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
        minH={{
          base: "auto",
          md: "550px",
        }}
        bg="white"
        boxShadow="2xl"
        borderRadius={{
          base: "md",
          md: "lg",
        }}
        overflow="hidden"
        direction={{
          base: "column",
          md: "row",
        }}
      >
        {/* LOGO */}
        <Box
          w={{
            base: "100%",
            md: "40%",
          }}
          minH={{
            base: "180px",
            sm: "210px",
            md: "550px",
          }}
          bg="blue.500"
          p={{
            base: 4,
            sm: 6,
            md: 8,
          }}
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

        {/* FORMULÁRIO */}
        <Box
          w={{
            base: "100%",
            md: "60%",
          }}
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
                  type="email"
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

            <Button
              w="100%"
              minH="48px"
              colorScheme="blue"
              type="submit"
              isLoading={carregando}
              loadingText={
                modoCadastro
                  ? "Criando igreja..."
                  : "Entrando..."
              }
              fontSize="md"
            >
              {modoCadastro
                ? "Registrar"
                : "Entrar"}
            </Button>
          </VStack>

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