import { useState, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  VStack,
  Image,
  useDisclosure,
  AlertDialog,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogOverlay,
  Link,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 🔧 URL do backend (Vite)
const API_URL = import.meta.env.VITE_API_URL;

const CadastroLogin = () => {
  const [modoCadastro, setModoCadastro] = useState(true);
  const [formData, setFormData] = useState({ nome: "", email: "", senha: "" });
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      sessionStorage.removeItem("idIgreja");

      if (!API_URL) throw new Error("API_URL não definida!");

      if (modoCadastro) {
        // ✅ CADASTRO DE NOVA IGREJA
        const response = await axios.post(`${API_URL}/api/cadastrar`, formData);

        // Verifica resposta do backend
        const message = response.data?.message || "Cadastro realizado!";
        toast({
          title: message,
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top",
        });

        // Armazena e-mail e nome da igreja
        sessionStorage.setItem("igrejaNome", formData.nome);
        sessionStorage.setItem("igrejaEmail", formData.email);
        sessionStorage.setItem("needsVerification", "true");

        // Abre aviso para confirmar código
        onOpen();
        setFormData({ nome: "", email: "", senha: "" });
      } else {
        // ✅ LOGIN DE IGREJA EXISTENTE
        const response = await axios.post(`${API_URL}/api/login`, {
          nome: formData.nome,
          senha: formData.senha.trim(),
        });

        const { idIgreja, primeiraVez, email } = response.data;

        sessionStorage.setItem("igrejaNome", formData.nome);
        sessionStorage.setItem("igrejaEmail", email || formData.email || "");

        if (primeiraVez) {
          sessionStorage.setItem("needsVerification", "true");
          onOpen();
        } else {
          sessionStorage.setItem("idIgreja", idIgreja);
          sessionStorage.setItem("needsVerification", "false");
          toast({
            title: "Login realizado com sucesso!",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top",
          });
          navigate("/dashboard");
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Erro desconhecido.";
      toast({
        title: "Erro ao processar.",
        description: msg,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      console.error("Erro:", error);
    }
  };

  const handleOk = () => {
    onClose();
    navigate("/confirmar-codigo");
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
            {modoCadastro ? (
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
            ) : (
              <Input
                placeholder="Nome ou E-mail da Igreja"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                autoComplete="organization"
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
              <Link onClick={() => navigate("/esqueci-senha")}>
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

      {/* Modal de confirmação */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold"
              color="blue.700"
            >
              Verifique seu e-mail
            </AlertDialogHeader>
            <AlertDialogBody>
              O código de verificação foi enviado para o e-mail cadastrado. 
              Cole-o na próxima tela para ativar sua conta.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} colorScheme="blue" onClick={handleOk}>
                OK
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
};

export default CadastroLogin;
