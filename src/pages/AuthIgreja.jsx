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
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Link,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CadastroLogin = () => {
  const [modoCadastro, setModoCadastro] = useState(true);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modoCadastro) {
        // Cadastro
        const response = await axios.post("http://localhost:3000/api/cadastrar", formData);

        alert("Cadastro realizado com sucesso!");

        // Salvar dados iniciais, mas NÃO salvar idIgreja aqui
        localStorage.setItem("igrejaNome", formData.nome);
        localStorage.setItem("igrejaEmail", formData.email);
        localStorage.setItem("email", formData.email);

        onOpen(); // abrir modal para informar que código foi enviado
        setFormData({ nome: "", email: "", senha: "" });
      } else {
        // Login
        // Limpar dados anteriores
        localStorage.removeItem("igrejaNome");
        localStorage.removeItem("idIgreja");

        const response = await axios.post("http://localhost:3000/api/login", {
          nome: formData.nome,
          senha: formData.senha,
          email: formData.email,
        });
        console.log("Login response:", response.data);

        const { idIgreja, primeiraVez } = response.data;

        localStorage.setItem("igrejaNome", formData.nome);
        localStorage.setItem("igrejaEmail", formData.email);
        localStorage.setItem("email", formData.email);

        if (primeiraVez) {
          // Se é a primeira vez, abrir modal para informar sobre o código
          onOpen();
        } else {
          // Se não é a primeira vez, salvar idIgreja aqui e ir para dashboard direto
          localStorage.setItem("idIgreja", idIgreja);
          alert("Login realizado com sucesso!");
          navigate("/dashboard");
        }
      }
    } catch (error) {
      alert("Erro: " + (error.response?.data?.message || "Erro ao conectar com o servidor"));
    }
  };

  const handleOk = () => {
    onClose();
    navigate("/confirmar-codigo"); // Navegar para tela de confirmação do código
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
        {/* Imagem */}
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

        {/* Formulário */}
        <Box w="60%" p={10}>
          <Text fontSize="3xl" fontWeight="bold" textAlign="center" color="blue.700">
            {modoCadastro ? "Criar Conta da Igreja" : "Login da Igreja"}
          </Text>

          <VStack spacing={5} mt={6} as="form" onSubmit={handleSubmit}>
            {modoCadastro && (
              <Input
                placeholder="E-mail da Igreja"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            )}
            <Input
              placeholder="Nome da Igreja"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
            <Input
              placeholder="Senha"
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
            />
            <Button w="full" colorScheme="blue" type="submit">
              {modoCadastro ? "Registrar" : "Entrar"}
            </Button>
          </VStack>

          {!modoCadastro && (
            <Text mt={2} textAlign="center" color="blue.500">
              <Link onClick={() => navigate("/esqueci-senha")}>Esqueceu a senha?</Link>
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
            {modoCadastro ? "Já tem conta? Faça login!" : "Não tem conta? Cadastre-se!"}
          </Text>
        </Box>
      </Flex>

      {/* Alerta: código enviado */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="blue.700">
              Verifique seu e-mail
            </AlertDialogHeader>

            <AlertDialogBody>
              O código de verificação foi enviado para o e-mail cadastrado. Cole-o na próxima tela para acessar o sistema.
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
