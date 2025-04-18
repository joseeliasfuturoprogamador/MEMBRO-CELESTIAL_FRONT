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
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CadastroLogin = () => {
  const [modoCadastro, setModoCadastro] = useState(true);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
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
        await axios.post("http://localhost:3000/api/igreja/registrar", formData);
        alert("Cadastro realizado com sucesso!");
        setModoCadastro(false);
        setFormData({ nome: "", email: "", password: "" });
      } else {
        // Limpa as informações anteriores no localStorage antes de fazer o login
        localStorage.removeItem("igrejaNome");
        localStorage.removeItem("token");

        const response = await axios.post("http://localhost:3000/api/igreja/conectar", {
          nome: formData.nome,
          password: formData.password,
        });

        const { idIgreja, primeiraVez, token } = response.data;
        localStorage.setItem("igrejaNome", formData.nome);
        localStorage.setItem("token", token); // Salva o novo token no localStorage

        if (primeiraVez) {
          localStorage.setItem("idIgreja", idIgreja);
          onOpen(); // abre o alerta estilizado
        } else {
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
    navigate("/verificar-token");
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
        {/* Seção da esquerda com imagem */}
        <Box w="40%" bg="blue.500" p={6} display="flex" alignItems="center" justifyContent="center">
          <Image src="./logo.jpg" alt="Logo Membro Celestial" maxH="250px" borderRadius="md" boxShadow="xl" />
        </Box>

        {/* Seção da direita com formulário */}
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Button w="full" colorScheme="blue" type="submit">
              {modoCadastro ? "Registrar" : "Entrar"}
            </Button>
          </VStack>

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

      {/* Alerta de confirmação do token */}
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
              O token de verificação foi enviado para o e-mail cadastrado. Cole-o na próxima tela para acessar o sistema.
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
