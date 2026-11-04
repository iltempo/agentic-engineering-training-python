import { Box, Button, Container, Heading, Input, Stack, Text, Link as ChakraLink } from "@chakra-ui/react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await signup(email, password, fullName)
      navigate("/contacts")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="md" py={16}>
      <Box bg="white" p={8} borderRadius="lg" shadow="md">
        <Stack gap={6}>
          <Heading size="lg" textAlign="center">Sign Up</Heading>

          <form onSubmit={handleSubmit}>
            <Stack gap={4}>
              <Box>
                <Text mb={2} fontWeight="medium">Full Name</Text>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                />
              </Box>

              <Box>
                <Text mb={2} fontWeight="medium">Email</Text>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </Box>

              <Box>
                <Text mb={2} fontWeight="medium">Password</Text>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                />
              </Box>

              {error && (
                <Text color="red.500" fontSize="sm">{error}</Text>
              )}

              <Button
                type="submit"
                colorScheme="blue"
                loading={isLoading}
                width="full"
              >
                Sign Up
              </Button>
            </Stack>
          </form>

          <Text textAlign="center" fontSize="sm">
            Already have an account?{" "}
            <ChakraLink asChild color="blue.500">
              <Link to="/login">Login</Link>
            </ChakraLink>
          </Text>
        </Stack>
      </Box>
    </Container>
  )
}
