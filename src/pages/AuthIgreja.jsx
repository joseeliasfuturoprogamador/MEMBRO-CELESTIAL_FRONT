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
    console.log(e.target.name, "=", e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      sessionStorage.removeItem("idIgreja");

      if (modoCadastro) {
        const response = await axios.post("http://localhost:3000/api/cadastrar", formData);

        alert("Cadastro realizado com sucesso!");

        sessionStorage.setItem("igrejaNome", formData.nome);
        sessionStorage.setItem("igrejaEmail", formData.email);
        sessionStorage.setItem("email", formData.email);

        onOpen();
        setFormData({ nome: "", email: "", senha: "" });
      } else {
        console.log("Enviando login com:", {
          nome: formData.nome,
          senha: formData.senha.trim(),
        });

        const response = await axios.post("http://localhost:3000/api/login", {
          nome: formData.nome,
          senha: formData.senha.trim(),
        });

        const { idIgreja, primeiraVez } = response.data;

        sessionStorage.setItem("igrejaNome", formData.nome);

        if (primeiraVez) {
          onOpen();
        } else {
          sessionStorage.setItem("idIgreja", idIgreja);
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
        {/* Imagem lateral */}
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

      {/* Modal de verificação */}
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
